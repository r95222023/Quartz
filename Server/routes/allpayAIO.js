var app = require('../lib/expressApp'),
    allpay = require('../lib/allpay');

app.post('/allpayAIO', function (req, res) {
    console.log(req.body);
    console.log('check'+allpay.genCheckMacValue(req.body));
    res.status(200).send('1|OK');
});

function allpayReturnHandler(data){
    var checkValue=data['CheckMacValue'];
    console.log(allpay.genCheckMacValue(data));
    if(checkValue===allpay.genCheckMacValue(data)) console.log('data validated')
}