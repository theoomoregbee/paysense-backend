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
var context = {};
var intentsHistory = [];


module.exports = {
    interact: function (req, res) {

        conversation.message({
            input: {text: req.query.message},
            context: context,
            workspace_id: workspace_id
        }, function (err, response) {
            if (err) {
                console.error(err);
                return res.serverError(err);
            } else {

                console.log(JSON.stringify(response, null, 2));

                context = response.context;

                //check if the this dialog contains intent
                if (response.intents[0]) {
                    var current_intent = response.intents[0].intent;
                    intentsHistory.push(current_intent);
                }

                var suggestions = [];

                if (!response.output.nodes_visited) {
                    return res.ok({output: "am still a baby, did not get that", suggestions: suggestions});
                }

                //let's check if this post requires suggestions for user
                var current_node = response.output.nodes_visited[0];
                if (GlobalVariables.nodes_with_yes_no_response.indexOf(current_node) > -1) {
                    suggestions = ["yes", "no"];
                }


                //check the last intent if it matches yes
                if (intentsHistory[intentsHistory.length - 1] == "yes") {
                    switch (current_node) {
                        case "continue with bvn":
                            console.info("go online to retrieve information with bvn :" + response.context.bvn);
                            BVNService.retrieveBVN(context, req, res);
                            break;
                        case "continue payment":
                            //we use pay with capture to make this payment
                            PaymentService.transfer(context, req, res);
                            // return res.ok({output: response.output.text, suggestions: suggestions});
                            break;

                    }
                } else if (intentsHistory[intentsHistory.length - 1] == "moneytransfer") {
                    //take the text and let's load up the beneficiaries
                    Beneficiary.find().exec(function (err, beneficiaries) {
                        if (err) return res.serverError(err);

                        GlobalVariables.beneficiaries = beneficiaries;
                        context.beneficiaries = beneficiaries;
                        var text = "";
                        suggestions = [];
                        for (var i = 0; i < beneficiaries.length; i++) {
                            text += "<br>" + (i + 1) + ". " + beneficiaries[i].name + ", " + beneficiaries[i].account_number;
                            suggestions.push(i + 1);
                        }

                        return res.ok({output: [response.output.text[0] + text], suggestions: suggestions});
                    });

                } else if (intentsHistory[intentsHistory.length - 1] == "account_balance") {
                    BVNService.retrieveAccountBalance(context, req, res);
                } else

                /**
                 * we start our bot node switch structuring here, after all the intent checking above
                 */
                    switch (current_node) {
                        case "enter beneficiary":
                            console.log("index", context.beneficiary_index);
                            context.beneficiary = GlobalVariables.beneficiaries[context.beneficiary_index - 1];
                            return res.ok({
                                output: [response.output.text[0] + " " + context.beneficiary.name + ", amount to transfer ?"],
                                suggestions: suggestions
                            });
                            break;
                        default:
                            return res.ok({output: response.output.text, suggestions: suggestions});
                    }


            }
        });
    }
};

