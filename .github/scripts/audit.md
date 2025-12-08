---
name: Integration Version Audit with Linear Tickets
overview: Conduct an AI-assisted audit of all integrations from `.github/scripts/versions.json`, use Cursor for codebase search and documentation walkthrough to analyze deprecation risks and version information, then create a master Linear ticket with subtickets for each integration requiring action using `.github/scripts/linearApi.js`, prioritized by urgency.
todos:
  - id: parse-versions-data
    content: Parse versions.json file and extract integration data (names, versions, sunset dates, docs)
    status: pending
  - id: analyze-with-cursor
    content: Use Cursor codebase search and documentation walkthrough to analyze each integration's current state and deprecation risks
    status: pending
    dependencies:
      - parse-versions-data
  - id: calculate-priorities
    content: Calculate priority levels and due dates based on sunset dates and version gaps
    status: pending
    dependencies:
      - analyze-with-cursor
  - id: create-master-ticket
    content: Create master Linear ticket with executive summary and categorization
    status: pending
    dependencies:
      - calculate-priorities
  - id: create-subtickets
    content: Create Linear subtickets for each integration requiring action with detailed analysis
    status: pending
    dependencies:
      - create-master-ticket
---

# Integration Version Audit with Linear Ticket Management

## Overview

Conduct an AI-assisted audit of all integrations from `.github/scripts/versions.json`, use Cursor's codebase search and documentation walkthrough capabilities to analyze deprecation risks and version information, then create a master Linear ticket with subtickets for each integration requiring action using the `.github/scripts/linearApi.js` helper module.

## Key Files

- **Data Source**: `.github/scripts/versions.json` - Contains integrations with version info, sunset dates, and documentation links.
- **Linear API Helper**: `.github/scripts/linearApi.js` - Helper module for creating and managing Linear tickets via API

**Important**: The workflow is performed entirely through AI-assisted analysis using Cursor's capabilities, with direct calls to `linearApi.js` functions for ticket creation.

**Environment Variables Required**:

- `LINEAR_API_KEY` - Required, Linear API key for authentication
- `LINEAR_TEAM_ID` - Required, Linear team ID (UUID) where tickets will be created

**Execution Context**: When calling `linearApi.js` functions, ensure the correct path is used:

- If executing from `.github/scripts/` directory: `require('./linearApi')`
- If executing from project root: `require('./.github/scripts/linearApi')`
- The `linearApi.js` file must be in the same directory or path must be adjusted accordingly

## Priority and Due Date Mapping

### Priority Levels:

- **Urgent (1)**: Deprecated with sunset date < 3 months
- **High (2)**: Deprecated with sunset date < 6 months
- **Medium (3)**: Deprecated with sunset date < 12 months OR using significantly outdated version
- **Low (4)**: Minor version updates, no immediate deprecation risk

### Due Date Logic:

- **Urgent**: Tomorrow (next calendar day from analysis date)
- **High**: Sunset date minus 90 days (approximately 3 months before)
- **Medium**: Sunset date minus 180 days (approximately 6 months before)
- **Low**: 12 months from analysis date (if no sunset date) or no specific due date (null)

**Note**: Due dates are calculated in calendar days. If the calculated due date is in the past, use tomorrow's date instead.

## Implementation Steps

### Phase 1: Data Parsing

1. **Parse versions.json**

- Read and parse `.github/scripts/versions.json`
- Extract for each integration:
- Destination name
- Current API versions in CloudMode Services
- Latest API Version rolled out
- Latest SDK Version rolled out
- Sunset dates (Current SDK Version and backend version)
- Documentation links (API and SDK)
- Comments/notes

### Phase 2: Analysis with Cursor

2. **Analyze integrations using Cursor**

- For each integration from versions.json:
  - **Codebase Search**: Use Cursor's semantic codebase search to:
    - Find integration implementation files
    - Search for version indicators (API endpoints, SDK versions, version constants)
    - Identify current version usage in the codebase
    - Locate relevant configuration and transformation files
  - **Documentation Walkthrough**: Use Cursor's `web_search` tool to:
    - Search and review official documentation links from versions.json
    - Search for and analyze migration guides and changelogs
    - Search for deprecation timelines and breaking changes information
    - Search for API/SDK version compatibility information
    - Verify latest version availability and release dates
    - Check for any announced deprecations or sunset dates not captured in versions.json
    - Gather detailed version upgrade requirements and migration steps
  - **Cross-reference**: Compare versions.json data with findings from codebase search and documentation
  - **Identify gaps**: Flag discrepancies between versions.json, codebase implementation, and official documentation
  - **Handle missing implementations**: If codebase search doesn't find the integration:
    - Note in ticket that integration may not be implemented in this repository
    - Integration might be in a different repository (e.g., rudder-server, rudder-sdk-js)
    - Still create ticket if action is required based on versions.json data
    - Include note in ticket description for manual verification

### Phase 3: Priority Calculation and Categorization

3. **Calculate priority and due dates**

- Parse sunset dates (see Date Parsing section for supported formats)
- For multiple sunset dates in one field, use the earliest one for priority calculation
- Calculate days until sunset (from today to sunset date)
- Extract major version numbers for comparison:
  - "v22.0" → 22
  - "22" → 22
  - "2025-04-15" → 2025 (use year for date-based versions)
  - "v1.76.0" → 1
  - "v2025.07" → 2025
  - If version strings don't contain numbers, compare as strings
- Apply priority logic:
  - **Urgent (1)**: < 90 days until sunset → Due: Tomorrow (next day)
  - **High (2)**: 90-180 days until sunset → Due: sunset date - 90 days (approximately 3 months before)
  - **Medium (3)**: 180-365 days until sunset OR version gap > 2 major versions → Due: sunset date - 180 days (approximately 6 months before)
  - **Low (4)**: > 365 days until sunset OR minor version updates → Due: 12 months from analysis date
- Handle edge cases: "TBD", "Not mentioned", "NA", "n/a", "Not applicable", ambiguous dates → Mark as Low priority (4) or Unknown category

4. **Categorize integrations**

Categorization logic:

- **Action Required**:
  - Has a sunset date (regardless of how far in the future)
  - Current version differs from latest version (and latest is not "NA"/"n/a")
  - Version gap > 2 major versions (even without sunset date)
  - Any deprecation risk or configuration issues identified
- **No Action**:
  - Up-to-date (current version matches latest version)
  - No sunset date announced
  - No version gap or only minor version differences
  - Compliant with latest standards
- **Unknown**:
  - Missing version information in versions.json
  - Unclear or ambiguous sunset dates that cannot be parsed
  - Missing documentation links
  - Needs manual review to determine status

### Phase 4: Linear Ticket Creation

5. **Create master Linear ticket**

- Use `.github/scripts/linearApi.js` helper module directly (no script execution needed)
- Call `createIssue()` function programmatically using Node.js:
  ```javascript
  const { createIssue } = require('./.github/scripts/linearApi');
  // Note: Path may need adjustment based on execution context
  // Ensure LINEAR_API_KEY and LINEAR_TEAM_ID environment variables are set
  const masterTicket = await createIssue({
    title: 'Integration Version Audit - Master Ticket',
    description: masterDescription, // Use Master Ticket Description Template (see below)
    priority: 3,
    labelIds: [], // Optional: add label IDs if labels exist in Linear
  });
  ```
  - Store returned ticket ID (`masterTicket.id`) for use as parent in subtickets
  - The returned object includes: `id`, `identifier` (e.g., "INT-4499"), `title`, and `url`

6. **Create subtickets for each integration requiring action**

- For each integration categorized as "Action Required":
- Call `createIssue()` function directly:
  ```javascript
  await createIssue({
    title: `${integrationName} Version Audit`, // No brackets needed, Linear will format
    description: ticketDescription, // Use Individual Integration Ticket Template (see below)
    parentId: masterTicket.id, // From step 5
    priority: calculatedPriority, // 1-4 based on urgency (1=Urgent, 4=Low)
    dueDate: calculatedDueDate, // ISO format string (YYYY-MM-DD) or null
    labelIds: [], // Optional: add label IDs if labels exist
  });
  ```
- Create all subtickets in batch after analysis completes
  - Handle errors gracefully: if one ticket creation fails, log the error and continue with remaining integrations
  - Consider adding a small delay between ticket creations to avoid rate limiting
  - **Verification**: After all tickets are created, verify that:
    - Master ticket was created successfully (check for ticket ID and URL)
    - All integrations requiring action have corresponding subtickets
    - Each subticket contains detailed analysis from codebase search and web_search findings
    - Priority and due dates are correctly assigned based on sunset dates and version gaps
    - Ticket descriptions include all relevant information from documentation review

7. **Log analysis summary**

   - After all analysis and ticket creation is complete, log a summary of what was done to console:

   ```javascript
   console.log('\n=== Integration Version Audit Summary ===');
   console.log(`Total Integrations Analyzed: ${totalIntegrations}`);
   console.log(`\nBy Category:`);
   console.log(`  - Action Required: ${actionRequiredCount}`);
   console.log(`  - No Action: ${noActionCount}`);
   console.log(`  - Unknown: ${unknownCount}`);
   console.log(`\nBy Priority:`);
   console.log(`  - Urgent (1): ${urgentCount}`);
   console.log(`  - High (2): ${highCount}`);
   console.log(`  - Medium (3): ${mediumCount}`);
   console.log(`  - Low (4): ${lowCount}`);
   console.log(`\nTickets Created:`);
   console.log(`  - Master Ticket: ${masterTicket.identifier} - ${masterTicket.url}`);
   console.log(`  - Subtickets: ${subticketsCreated} tickets created`);
   if (errors.length > 0) {
     console.log(`\nErrors Encountered: ${errors.length}`);
     errors.forEach((err) => console.log(`  - ${err}`));
   }
   console.log('\n=== End of Audit Summary ===\n');
   ```

   - Logging should include:
     - Total integrations analyzed
     - Breakdown by category (Action Required, No Action, Unknown)
     - Breakdown by priority (Urgent, High, Medium, Low)
     - Master ticket identifier and URL
     - Number of subtickets created
     - List of any errors encountered during the process
   - All logging is done via `console.log()` - no files are created

8. **Verify analysis completion and ticket creation**

   - After logging the summary, verify that the audit process completed successfully:
   - **Analysis Verification**:
     - All integrations from versions.json were analyzed
     - Codebase search was performed for each integration
     - Web search was used to review documentation for version details
     - Priorities and due dates were calculated for all integrations
     - All integrations were properly categorized
   - **Ticket Creation Verification**:
     - Master ticket was created and has a valid ID and URL
     - Number of subtickets created matches the number of integrations requiring action
     - Each subticket contains:
       - Detailed analysis from codebase search findings
       - Information gathered from web_search of documentation
       - Correct priority level based on sunset dates and version gaps
       - Appropriate due date calculated from priority logic
       - Complete ticket description with all relevant details
   - **Error Handling**: If verification fails, log specific errors and ensure all available information is still captured in created tickets
   - **Completion**: The audit is considered complete only when:
     - All analysis steps are finished
     - All required Linear tickets are created successfully
     - Summary is logged to console
     - Any errors are documented in the summary log

**linearApi.js Functions Available:**

- `createIssue({ title, description, parentId, priority, labelIds, dueDate })` - Create a new Linear ticket
  - **Note**: Team ID is taken from `LINEAR_TEAM_ID` environment variable (not passed as parameter)
  - Parameters: `title` (required), `description` (required), `parentId` (optional), `priority` (optional, default: 3), `labelIds` (optional array), `dueDate` (optional ISO string)
- `listIssuesByParent(parentId, limit)` - List all subtickets for a parent ticket
- `updateIssueDescription(issueId, description)` - Update an existing ticket's description

**Note**: These functions are called directly during the AI-assisted analysis process. No separate script file is required. The `LINEAR_TEAM_ID` environment variable must be set before calling these functions.

## Linear Ticket Templates

### Master Ticket Description Template

```markdown
# Integration Version Audit - Executive Summary

**Last Updated**: [Current Date]  
**Total Integrations Analyzed**: [Number] / [Total]  
**Progress**: 100%

## 🚨 Critical Issues (Urgent Priority)

**Count**: [Number]

- [Integration Name] - Due: [Date] - [Brief description]

## ⚠️ High Priority Updates

**Count**: [Number]

- [Integration Name] - Due: [Date] - [Brief description]

## 📋 Medium Priority Monitoring

**Count**: [Number]

- [Integration Name] - Due: [Date] - [Brief description]

## ✅ Low Priority / Up-to-Date

**Count**: [Number]

- [Integration Name] - [Status]

## ✅ No Action Required (Up-to-Date & Compliant)

**Count**: [Number]

- [Integration Name] - [Brief reason - e.g., "Latest version v2.1.0, no deprecation announced"]
- [Integration Name] - [Brief reason - e.g., "Using current API v3, compliant with latest standards"]

## ❓ Unknown / Pending Further Info

**Count**: [Number]

- [Integration Name] - [Issue description]

## 🔗 Master Documentation

- [versions.json](.github/scripts/versions.json)

## 📋 Next Actions

1. **Immediate**: Review and assign urgent tickets
2. **This Week**: Plan high priority upgrades
3. **This Month**: Schedule medium priority reviews
```

### Individual Integration Ticket Description Template

````markdown
# [Integration Name] Version Audit Results

## 🔍 Current State Analysis

**versions.json Current Version**: `[version]`  
**Latest Available Version**: `[version]`

## ⚠️ Deprecation Information

**Sunset Date**: [date or "None announced"]  
**Migration Path**: [details or "N/A"]  
**Urgency Level**: [CRITICAL/HIGH/MEDIUM/LOW]

## 🔗 Reference Links

**Official Documentation**: [URL from versions.json]  
**Migration Guide**: [URL if available]  
**Changelog**: [URL if available]

## 📋 Action Items

### Immediate Actions Required:

- [ ] Review current version implementation in codebase
- [ ] Check for breaking changes in latest version documentation
- [ ] Plan migration timeline based on sunset date (if applicable)
- [ ] Update API/SDK version references in codebase

### Implementation Steps:

1. Review official documentation and migration guides for breaking changes
2. Test new version in staging environment (if sunset date exists, complete before sunset)
3. Update version references in codebase (config files, API endpoints, SDK URLs)
4. Run integration tests and verify backward compatibility
5. Deploy to production and monitor for issues

### Testing Requirements:

- [ ] Verify backward compatibility
- [ ] Test migration path
- [ ] Update integration tests

## 🎯 Success Criteria

- [ ] Version updated across all repositories
- [ ] Tests passing
- [ ] Documentation updated
- [ ] No breaking changes for existing users

## ⚠️ Risk Assessment

**Breaking Changes**: [Yes/No - details from documentation review]

**Customer Impact**: [High/Medium/Low - based on priority level and sunset date proximity]

**Rollback Plan**: [Maintain previous version support until migration is verified, or describe specific rollback steps]

## 📝 Additional Notes

[Any other relevant information, edge cases, or considerations]

```

## Analysis and Ticket Creation Workflow

### AI-Assisted Analysis Process

The audit is performed through AI-assisted analysis using Cursor's capabilities:

1. **Parses versions.json**: Extracts integration data (names, versions, sunset dates, documentation links)
2. **Cursor Codebase Search**: Uses Cursor's semantic search to:
   - Find integration implementations across the codebase
   - Search for version-specific patterns (API endpoints, SDK versions, constants)
   - Identify current version usage and configuration
   - Discover related files and dependencies
3. **Cursor Documentation Walkthrough**: Uses Cursor's `web_search` tool to:
   - Search and navigate official documentation links from versions.json
   - Search for and review migration guides and changelogs
   - Search for deprecation timelines and breaking changes information
   - Cross-reference multiple documentation sources via web search
   - Verify version information and gather detailed upgrade requirements
4. **Calculates priorities**: Parses sunset dates, calculates urgency, determines due dates based on analysis findings
5. **Creates Linear tickets**: Uses `linearApi.js` helper module to programmatically create tickets with comprehensive analysis results
6. **Logs analysis summary**: Outputs a summary of the audit process to console, including statistics, ticket information, and any errors encountered

### Date Parsing

Handle various date formats when parsing sunset dates. When multiple dates are present (e.g., multiple version ranges), use the earliest sunset date for priority calculation:

**Supported Formats:**
- "April 30, 2026" - Standard date format
- "April 28th, 2026" - Date with ordinal suffix
- "September 2025" - Month and year only (use last day of month)
- "@May 6, 2025" - Date with @ prefix
- "v17 @June 4, 2025" - Version prefix with date
- "2023-02-22 → till 2025-02-22" - Date range (use end date)
- "2023-02-22 → till 2025-02-22\n2024-06-15 → till 2026-06-15" - Multiple ranges (use earliest end date)

**Parsing Rules:**
- Extract the end date from ranges (after "→" or "till")
- For multiple ranges, use the earliest sunset date for urgency calculation
- For month-only dates (e.g., "September 2025"), use the last day of that month
- Handle ordinal suffixes (st, nd, rd, th) in dates

### Linear API Integration

Use the existing `.github/scripts/linearApi.js` module for ticket creation. Functions are called directly during the AI-assisted analysis process:

- **Module exports**: `createIssue`, `listIssuesByParent`, `updateIssueDescription`
- **Environment Variables Required**:
  - `LINEAR_API_KEY` - Linear API key for authentication (required)
  - `LINEAR_TEAM_ID` - Linear team ID (UUID) where tickets will be created (required)
- **Usage**: Functions are called directly from the analysis workflow using Node.js, not through a separate script execution
- **No Script Required**: The audit process uses `linearApi.js` functions directly; no separate audit script file (like `audit.js`) is needed or should be created

## Output Deliverables

1. **Master Linear Ticket**: Executive summary with all integrations categorized, created via `linearApi.js`
2. **Sub-tickets**: Individual tickets for each integration requiring action, created via `linearApi.js` with proper parent-child relationships
3. **Ticket URLs**: All created tickets include URLs for easy access and tracking
4. **Analysis Summary Log**: Summary of the audit process logged to console, including:
   - Total integrations analyzed
   - Breakdown by category (Action Required, No Action, Unknown)
   - Breakdown by priority (Urgent, High, Medium, Low)
   - Master ticket identifier and URL
   - Number of subtickets created
   - Any errors encountered during the process
   - **Note**: This is logged to console only (via `console.log()`), no files are created

## Notes

- **Workflow**: AI-assisted analysis using Cursor for codebase search and documentation walkthrough, then create master ticket with subtickets using `linearApi.js`
- **No Script File Required**: This audit process does not require creating or running any script file (such as `audit.js`). All analysis is performed through AI-assisted methods using Cursor, and tickets are created by calling `linearApi.js` functions directly during the analysis process.
- **Analysis Tools**:
  - **Cursor Codebase Search**: Semantic search across the codebase to find integration implementations and version usage
  - **Cursor Web Search**: Use `web_search` tool to search and review official documentation, migration guides, changelogs, and version information from external sources
- **Data Source**: Use local `versions.json` file as primary data source, supplemented by Cursor analysis
- **Linear API**: Uses existing `.github/scripts/linearApi.js` helper module (API key already configured). Functions are called directly during the AI-assisted analysis process.
- **Ticket Creation**: Tickets are created programmatically via Linear GraphQL API through the helper module, called directly from the analysis workflow
- **Error Handling**:
 - Ambiguous sunset dates → Mark as "Unknown" category, Low priority (4)
 - Missing version info → Categorize as "Unknown", request manual review in ticket description
 - API errors (Linear API failures) → Log error with integration name, continue with remaining integrations, note failures in summary
 - Codebase search returns no results → Still create ticket if action required, note in ticket that "Integration may not be implemented in codebase or uses different naming"
 - Multiple sunset dates in one field → Use earliest sunset date for priority calculation
 - Invalid date formats → Mark as "Unknown" category, include original date string in ticket for manual review
- **Edge Cases**: Handle "NA", "n/a", "Not applicable", "TBD", empty strings gracefully when parsing data
```
````
