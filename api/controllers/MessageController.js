/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var ConversationV1 = require('watson-developer-cloud/conversation/v1');

var conversation = new ConversationV1({
    username: 'c23596d0-40e7-4aa3-80e7-d80b252c857e',
    password: 'q6utoCaJm586',
    version_date: ConversationV1.VERSION_DATE_2017_02_03
});

var workspace_id = "0f6757d7-6ad3-4df0-9f68-a49697d3dfe6";

module.exports = {
    interact: function (req, res) {

        conversation.message({
            input: {text: req.query.message},
            context:{name:"test"},
            workspace_id: workspace_id
        }, function (err, response) {
            if (err) {
                console.error(err);
            } else {
                console.log(JSON.stringify(response, null, 2));
            }
        });
    }
};

