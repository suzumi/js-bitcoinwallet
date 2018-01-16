// ウォレット初回起動時の処理
var tbtc = {network: bitcoin.JS.networks.testnet}
var key = bitcoin.JS.ECPair.makeRandom(tbtc)
var privateKey = key.toWIF() //これが秘密鍵
var walletAddr = key.getAddress(); // アドレス
// console.log(walletAddr);


// var privateKey = 'cU2pttHqw29LuDQyF5YXw3ecqJ5sAH9E57KJNpuV85psmR4RyyJx';
// var walletAddr = 'mvwoXtvS8euUzA3qgahjXqXjW8CnSbofpN';

// 残高管理
var balance = (address) => {
    let ep = `https://testnet-api.smartbit.com.au/v1/blockchain/address/${address}?tx=0`;
    $.ajax({
        url: ep,
        type:'GET'
    })
    .done((data) => {
        let balance = data.address.total.balance;
        console.log(balance);
        $('#balance').html(balance)
    })
    .fail( (err) => {
        console.log(err);
    });
};

// トランザクション作成
var buildTx = (address, privateKey) => {
    let ep = `https://testnet-api.smartbit.com.au/v1/blockchain/address/${address}/unspent?limit=1000`
    $.ajax({
        url: ep,
        type:'GET'
    })
    .done((data) => {
        // トランザクションの作成
        console.log(`wallet address => ${walletAddr}`);
        console.log(`privateKey => ${privateKey}`);
        var key = bitcoin.JS.ECPair.fromWIF(privateKey);
        data.unspent.forEach(function(e, idx) {
            txb.addInput(e.txid, e.n);
            // 取引の署名
            txb.sign(e.n, key); // 最初の数字は入力の索引、複数入力の場合複数回 signしないといけない
        });
        // 送信先のアドレスと数量
        // txb.addOutput(targetAddr, amount);
    })
    .fail( (err) => {
        console.log(err);
    });
};

// トランザクションの送信
var sendTx = (targetAddr, amount) => {
    let ep = ` https://testnet-api.smartbit.com.au/v1/blockchain/pushtx`;
    let payload = '{hex:"' + txb.build().toHex() + '"}';

    $.ajax({
        url: ep,
        type:'GET'
    })
    .done((data) => {
        // 取引の作成
        var key = bitcoin.JS.ECPair.fromWIF(privateKey);
        data.unspent.forEach(function(e) {
            txb.addInput(e.txid, e.n);
            // 取引の署名
            txb.sign(0, key); // 最初の数字は入力の索引、複数入力の場合複数回 signしないといけない
        }, this);
        // 送信先のアドレスと数量
        txb.addOutput(targetAddr, amount);
        
    })
    .fail( (err) => {
        console.log(err);
    });
};

// 送金ボタン押下
$('#sendBtn').on('click', () => {
    var txb = new bitcoin.JS.TransactionBuilder(tbtc);

    let toAddr = $('#s_addr').val();
    let amount = $('#s_amount').val();
    console.log(`送信先：${toAddr} 数量：${amount}`);
});

// balance(walletAddr);
buildTx(walletAddr, privateKey);
