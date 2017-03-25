/**
 * Created by theophy on 25/03/2017.
 */


var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var conversation = new ConversationV1({
    username: 'c23596d0-40e7-4aa3-80e7-d80b252c857e',
    password: 'q6utoCaJm586',
    version_date: ConversationV1.VERSION_DATE_2017_02_03
});

var workspace_id = "0f6757d7-6ad3-4df0-9f68-a49697d3dfe6";

module.exports = {

    /**
     * this helps us to retrieve our bvn from the entered context.bvn
     * @param context
     * @param request
     * @param response
     */
    retrieveBVN: function (context, request, response) {
        GlobalVariables.bvn = context.bvn;
        User.findOne({bvn: GlobalVariables.bvn}).exec(function (err, user) {
            if (err) response.serverError(err);

            if (!user) {
                context.bvn_error = true;
                conversation.message({
                    context: context,
                    workspace_id: workspace_id
                }, function (err, res) {
                    if (err) return response.serverError(err);

                    //clear our context bvn error
                    delete context.bvn_error;
                    return response.ok({output: res.output.text, suggestions: []});
                });
                //return response.serverError('No user with this details found, please visit the bank');
            } else {


                //no error
                context.user = user;
                conversation.message({
                    input: {text: "gotten bvn"},
                    context: context,
                    workspace_id: workspace_id
                }, function (err, res) {
                    if (err) return response.serverError(err);

                    return response.ok({output: res.output.text, suggestions: []});
                });
            }

        });
    },

    /**
     * used to get the balance of the user
     * @param context
     * @param request
     * @param response
     */
    retrieveAccountBalance: function (context, request, response) {
        //take the text and let's load up the beneficiaries
        User.findOne(context.user.id).exec(function (err, user) {
            if (err) return res.serverError(err);


            //no error
            context.user = user;
            conversation.message({
                input: {text: "balance_retrieved"},
                context: context,
                workspace_id: workspace_id
            }, function (err, res) {
                if (err) return response.serverError(err);

                return response.ok({output: res.output.text, suggestions: []});
            });

        });
    }


};