// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'nw69jrn0e8'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-0lugmawz.us.auth0.com',            // Auth0 domain
  clientId: 'J29IHhZZ2w9IiURWpqkazprTvYLvDaec',          // Auth0 client id
  callbackUrl: 'http://dev-todo-site-badr-1221.s3-website.us-east-2.amazonaws.com/callback'
}
