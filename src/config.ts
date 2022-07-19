import path from 'path'

export default {
  program: {
    name: 'IMust',
    version: '0.0.1-beta.6',
    description: 'A command line tool for developers',
  },
  scripts: {
    location: path.resolve(__dirname, '../scripts/'),
    connectToDb: 'connect-to-db.sh',
  },
}
