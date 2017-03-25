/**
 * Created by theophy on 25/03/2017.
 */

var PayWithCapture = require('PayWithCapture');
var request = require('request');

var clientId = "eyet636484u4h", //Your clientId is in your PayWithCapture DevCenter account page
    clientSecret = "736484yekhgutit857485", //Your clientSecret is in your PayWithCapture DevCenter account page
    env = "staging"; // env can either be staging or production
var pwcClient = new PayWithCapture(clientId, clientSecret, env);
var accountPayment = pwcClient.getAccountPayment();
var Authentication = pwcClient.getAuthentication();


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    /**
     * this is used to make transfer
     * @param context
     * @param req
     * @param res
     */
    transfer: function (context, req, res) {

        if (!context.user) {
            return res.ok({output: ["Unable to locate your bvn, please re-validate me"], suggestions: []});
        }

        //let's check the account balance of the user
        var account_balance = context.user.account_balance - context.amount;

        if (account_balance < 1) {
            return res.ok({output: ["the money you want to send will not be enough", "this is your account balance N" + context.user.account_balance + ", and can't afford that transaction to " + context.beneficiary.name]});
        }

        var data = {
            "amount": context.amount,
            "description": "Transfer to" + context.beneficiary.name + " " + context.beneficiary.account_number,
            "Transaction_id": "PWCDEV-09882890" + context.beneficiary.account_number + "" + getRandomIntInclusive(0, 50),
            "account_number": context.beneficiary.account_number, //account number you wish to charge
            "type": "transfer",
            "bankcode": "044",
            "creditacctno": "0690000012",//context.user.account_number,
            "transferType": "AA"
        };

        //get token
        request.post({
            url: 'http://pwcstaging.herokuapp.com/oauth/token',
            form: {
                grant_type: 'client_credentials',
                client_id: "58d69247f800fa10000af484",
                client_secret: "qAkZ0dKDQDvzoDV7ey6NteqN7qlzNgkLgXhw9eXp9vMpWrYhjKf8s5YgPtzkUD9vA61H1Zu99i8mk5OkFFnfZU2FALL4E3SXCPhE"
            }
        }, function (err, httpResponse, body) {
            if (err) return res.serverError(err);

            //let's move to payment since we have the token now
            var token = JSON.parse(body).access_token;

            console.log("token", token, body);

            var options = {
                url: 'http://pwcstaging.herokuapp.com/orders/makePayment',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: data
            };

            //make payment
            request.post(options, function (err2, httpResponse, body) {
                if (err2) return res.serverError(err2);


                console.log("payment body", body);

                //let's update this user balance
                User.update(context.user.id, {account_balance: account_balance}).exec(function (errBalance, updatedUser) {
                    if (errBalance) res.serverError(errBalance);

                    res.ok({
                        output: ["Payment made successfully to " + context.beneficiary.name + ", you can check your email for pay with capture transaction details",
                            "your account balance is " + account_balance],
                        suggestions: []
                    });
                });
            });

        });

        /*
         Authentication.authenticate()
         .then(function(authResp) {
         //do what ever you need with the authResp
         //you can do JSON.stringify to inspect the object
         return res.ok(authResp);
         }, function (failed) {
         return res.ok(failed);
         });
         //this method will charge the card for you and return a response
         // you will need to validate this payment with the otp sent to the account holder's phone
         accountPayment.createPayment(data)
         .then(function (resp) {
         // do whatever you want with the response.
         // do JSON.stringify the response to see all attributes available

         return res.ok(resp);
         });*/
    }
};