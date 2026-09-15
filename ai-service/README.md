# AI Service

This is a Node.js service built with Express.js. It is responsible for answering user questions regarding their expenses, debts, and groups using RAG technology and a language model.

## Setup


Then, run the following command to install dependencies:

npm install

Start the server with the following command:

npm start

## Endpoints

There is an endpoint named `/api/chat` that accepts a POST request containing a field named `question` and returns a complete answer along with its sources.

There is an endpoint named `/api/chat/stream` that accepts the same request but returns the answer incrementally using Server-Sent Events.

There is an endpoint named `/api/sentiment` that accepts a field named `text` and returns the sentiment classification for that text.

There is an endpoint named `/health` that does not require a token and is used to check the service's status.

All `/api` endpoints require an `Authorization` header containing the word "Bearer" followed by a valid JWT token.

## Security Testing

There is a test file located at `tests/security.test.js` that verifies users can only access their own data.

To run it, the server must first be started without a `DATABASE_URL` value so that separate mock data is used for each user.

Then, run the following command in a separate terminal window:

npm run test:security

## Important Note for the Backend Team

The file `src/dataSource.js` contains SQL queries that assume the existence of tables named `expenses`, `debts`, `groups`, `group_members`, and `users`.

If the actual table or column names in the project differ, this file must be updated to match them before the final merge.
