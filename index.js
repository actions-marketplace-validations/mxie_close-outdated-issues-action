const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const token = core.getInput("token");
  const octokit = new github.GitHub(token);
  const ghContext = github.context;

  const { data: openIssues } = await octokit.issues.listForRepo({
    ...ghContext.repo,
    state: "open",
  });

  const datePattern = /(\d\d?).(\d\d?).(\d{2,4})/;
  const today = new Date();

  console.log(`Found ${openIssues.length} open issues.`);

  let issuesClosed = 0;

  for (const issue of openIssues) {
    const issueNumber = issue.number;
    const issueTitle = issue.title;

    const results = datePattern.exec(issueTitle);

    if (results !== null) {
      let [month, day, year] = results.slice(1).map((part) => parseInt(part, 10));

      // if the year is under 100, assume it's from the 2000s
      if (year < 100) {
        year += 2000;
      }

      const issueDate = new Date(year, month - 1, day);

      console.log(`Date found in title: ${issueDate.toDateString()}`)

      if (issueDate < today) {
        octokit.issues.update({
          ...ghContext.repo,
          issue_number: issueNumber,
          state: "closed",
        });

        console.log(`Closed #${issue.number}.`);

        issuesClosed++;
      }
    }
  }

  console.log(`Closed ${issuesClosed} issues.`);
}

run();
