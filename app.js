const express = require('express');
const bodyParser = require('body-parser');
const engines = require('consolidate')
const paypal = require('paypal-rest-sdk');

const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Afuk973ee-SgfBryg0X1upw7nG2xPXTQsIWpzcGbCokLtQN5ljVNNvWxMvO15q_iWV-op9q6nGeWf6nJ',
    'client_secret': 'ENa2jljIrqZWNMMJDWaDGetUd49_gSy53HTLUM689mHV_RmSC5zXAlf94IBY8Ua1-AWlag8wSxpBT_Ya'
});

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/paypal", (req, res) => {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel",
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href )
        }
    });
});

app.get('/success',(req, res) => {
    //res.send('Success');
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        "payer_id": PayerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };
    
    
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render('success');
        }
    });
});

app.get("cancel", (req, res) => {
    res.render("cancel");
});

/*app.listen(3000, () => {
    console.log("Server is running");

});
*/
var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log("Express is working on port " + port);
})