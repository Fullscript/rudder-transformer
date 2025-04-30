# Braze Integration

This document outlines the specifications and capabilities of the RudderStack Braze destination integration.

## Integration Functionalities

### Technical Details
- Implementation: JavaScript
- Current Version: v0
- Source Code: `src/v0/destinations/braze/`

### Supported Message Types
- `identify`: User profile updates and identity resolution
- `track`: Custom events and purchases
- `page`: Page view events
- `screen`: Screen view events
- `group`: Group membership and subscription management
- `alias`: User identity merging

### Batching Support
- Track events: Up to 75 events per batch
- Identify calls: Up to 50 users per batch
- Alias operations: Up to 50 merges per batch
- Subscription group updates: Up to 25 updates per batch

### Intermediate Calls
The integration makes intermediate calls for identity resolution during identify events when both anonymousId and userId are present.
- Endpoint: `/users/identify`
- Documentation: [Braze User Identify API](https://www.braze.com/docs/api/endpoints/user_data/post_user_identify/)

### Proxy Delivery
Proxy delivery is supported through the data delivery handler.
Source: `test/integrations/destinations/braze/dataDelivery/`

### User Deletion
Supports user deletion through dedicated API endpoints.
Source: `src/v0/destinations/braze/deleteUsers.js`

### Additional Functionalities
1. Deduplication Support
   - Configurable through `supportDedup` option
   - Prevents duplicate user profile updates
   - Maintains user store for deduplication checks

2. Subscription Group Management
   - Supports email and SMS subscription management
   - Configurable through `enableSubscriptionGroupInGroupCall`

## General Queries

### Event Ordering
- Event ordering is not strictly required by Braze
- Events are processed in the order they are received
- Purchase events are automatically handled in order

### Data Replay Feasibility

#### Missing Data Replay
- Supported through standard REST APIs
- No limitations on historical data
- Recommended to use batch endpoints for efficiency

#### Duplicate Data Handling
- Safe to replay with deduplication enabled
- Without deduplication:
  - Profile updates: Last-write-wins
  - Events: Will be duplicated
  - Purchases: Will be duplicated

## Version Information

### Current Version
- Version: v0
- Status: Active
- No immediate deprecation planned

### Future Versions
- No new version announced
- Continue monitoring [Braze API Changelog](https://www.braze.com/docs/api/api_changelog/)

### Documentation References
- [Braze REST API Guide](https://www.braze.com/docs/api/basics/)
- [User Track Endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track/)
- [User Identify Endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_identify/)
- [User Delete Endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_delete/)

## Additional Documentation
- [RETL Configuration](docs/retl.md)
- [Business Logic and Mappings](docs/businesslogic.md)