import csv from 'csvtojson';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const j2m = require('jira2md');

/**
 * Import issues from a Jira CSV export.
 *
 * @param filePath Path to CSV file
 * @param orgSlug Jira site name
 * @param customUrl Non-cloud Jira instance base URL
 */
export class YouTrackCsvImporter {
  constructor(filePath) {
    this.filePath = filePath;
  }

  get name() {
    return 'Jira (CSV)';
  }

  get defaultTeamName() {
    return 'Jira';
  }

  import = async () => {
    const data = await csv().fromFile(this.filePath);

    const importData = {
      issues: [],
      labels: {},
      users: {},
      statuses: {},
    };

    const statuses = Array.from(new Set(data.map(row => row.Status)));
    const assignees = Array.from(new Set(data.map(row => row.Assignee)));

    for (const user of assignees) {
      importData.users[user] = {
        name: user,
      };
    }
    for (const status of statuses) {
      if (importData.statuses?.[status]) {
        importData.statuses[status] = {
          name: status,
        };
      }
    }

    for (const row of data) {
      const url = undefined;
      const mdDesc = row.Description
        ? j2m.to_markdown(row.Description)
        : undefined;
      const description = mdDesc;
      const priority = mapPriority(row.Priority);
      const type = `Type: ${row['Issue Type']}`;
      const release =
        row.Release && row.Release.length > 0
          ? `Release: ${row.Release}`
          : undefined;
      const assigneeId =
        row.Assignee && row.Assignee.length > 0 ? row.Assignee : undefined;
      const status = row.Status;

      const labels = [type];
      if (release) {
        labels.push(release);
      }

      importData.issues.push({
        title: row.Summary,
        description,
        status,
        priority,
        url,
        assigneeId,
        labels,
      });

      for (const lab of labels) {
        if (!importData.labels[lab]) {
          importData.labels[lab] = {
            name: lab,
          };
        }
      }
    }

    return importData;
  };

  // -- Private interface

  filePath;
}

const mapPriority = input => {
  const priorityMap = {
    Highest: 1,
    High: 2,
    Medium: 3,
    Low: 4,
    Lowest: 0,
  };
  return priorityMap[input] || 0;
};