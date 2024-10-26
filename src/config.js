const path = require('path')

module.exports = {
  program: {
    name: 'IMust',
    version: '0.1.0',
    description: 'A command line tool for developers',
  },
  scripts: {
    location: path.resolve(__dirname, '../scripts/'),
    connectToDb: 'connect-to-db.sh',
  },
}
