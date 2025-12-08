// Linear API helper for @audit.md workflow to create and manage Linear tickets using the Linear GraphQL API

const axios = require('axios');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;

if (!LINEAR_API_KEY) {
  console.error('LINEAR_API_KEY is required');
  process.exit(1);
}
if (!LINEAR_TEAM_ID) {
  console.error('LINEAR_TEAM_ID is required');
  process.exit(1);
}

const linearClient = axios.create({
  baseURL: 'https://api.linear.app',
  headers: {
    Authorization: LINEAR_API_KEY,
    'Content-Type': 'application/json',
  },
});

async function createIssue({ title, description, parentId, priority, labelIds, dueDate }) {
  const mutation = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      title,
      description,
      teamId: LINEAR_TEAM_ID,
      parentId: parentId || null,
      priority: priority || 3,
      labelIds: labelIds || [],
      dueDate: dueDate || null,
    },
  };

  try {
    const res = await linearClient.post('/graphql', { query: mutation, variables });
    if (res.data.errors) {
      throw new Error(`Linear GraphQL error: ${JSON.stringify(res.data.errors)}`);
    }
    return res.data.data.issueCreate.issue;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Linear API error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
      );
    }
    throw error;
  }
}

async function listIssuesByParent(parentId, limit = 250) {
  const query = `
    query IssuesByParent($parentId: ID!, $first: Int!) {
      issues(filter: { parent: { id: { eq: $parentId } } }, first: $first) {
        nodes {
          id
          identifier
          title
          priority
          url
          dueDate
          state { name }
        }
      }
    }
  `;

  const variables = { parentId, first: limit };
  try {
    const res = await linearClient.post('/graphql', { query, variables });
    if (res.data.errors) {
      throw new Error(`Linear GraphQL error: ${JSON.stringify(res.data.errors)}`);
    }
    return res.data.data.issues.nodes;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Linear API error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
      );
    }
    throw error;
  }
}

async function updateIssueDescription(issueId, description) {
  const mutation = `
    mutation UpdateIssue($id: String!, $description: String!) {
      issueUpdate(id: $id, input: { description: $description }) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
  `;

  const variables = { id: issueId, description };
  const res = await linearClient.post('/graphql', { query: mutation, variables });
  if (res.data.errors) {
    throw new Error(`Linear GraphQL error: ${JSON.stringify(res.data.errors)}`);
  }
  return res.data.data.issueUpdate.issue;
}

module.exports = { createIssue, listIssuesByParent, updateIssueDescription };
