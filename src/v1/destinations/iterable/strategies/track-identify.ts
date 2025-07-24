import { forEachInBatches } from '@rudderstack/integrations-lib';
import { BaseStrategy } from './base';
import { GenericProxyHandlerInput, IterableBulkProxyInput } from '../types';
import { createBatchErrorChecker } from '../utils';
import { DeliveryJobState, DeliveryV1Response } from '../../../../types';
import { TransformerProxyError } from '../../../../v0/util/errorTypes';
import { getDynamicErrorType } from '../../../../adapters/utils/networkUtils';
import { TAG_NAMES } from '../../../../v0/util/tags';

class TrackIdentifyStrategy extends BaseStrategy {
  handleSuccess(responseParams: IterableBulkProxyInput): DeliveryV1Response {
    const { destinationResponse, rudderJobMetadata, destinationRequest } = responseParams;
    const { status } = destinationResponse;
    const responseWithIndividualEvents: DeliveryJobState[] = [];

    const { events, users } = destinationRequest?.body.JSON || {};
    const finalData = events || users;

    if (finalData) {
      // Create optimized error checker for this batch
      const checkEventError = createBatchErrorChecker(destinationResponse);

      // Process events in batches for better performance
      forEachInBatches(
        finalData,
        (event, idx) => {
          const parsedOutput = {
            statusCode: 200,
            metadata: rudderJobMetadata[idx],
            error: 'success',
          };

          const { isAbortable, errorMsg } = checkEventError(event);
          if (isAbortable) {
            parsedOutput.statusCode = 400;
            parsedOutput.error = errorMsg;
          }
          responseWithIndividualEvents.push(parsedOutput);
        },
        { batchSize: 50 },
      );
    }

    return {
      status,
      message: '[ITERABLE Response Handler] - Request Processed Successfully',
      destinationResponse,
      response: responseWithIndividualEvents,
    };
  }

  handleError(responseParams: GenericProxyHandlerInput): void {
    const { destinationResponse, rudderJobMetadata } = responseParams;
    const { response, status } = destinationResponse;
    const responseMessage = response.params || response.msg || response.message;
    const errorMessage = JSON.stringify(responseMessage) || 'unknown error format';

    const responseWithIndividualEvents = rudderJobMetadata.map((metadata) => ({
      statusCode: status,
      metadata,
      error: errorMessage,
    }));

    throw new TransformerProxyError(
      `ITERABLE: Error transformer proxy during ITERABLE response transformation. ${errorMessage}`,
      status,
      { [TAG_NAMES.ERROR_TYPE]: getDynamicErrorType(status) },
      destinationResponse,
      '',
      responseWithIndividualEvents,
    );
  }
}

export { TrackIdentifyStrategy };
