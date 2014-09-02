nodejs-update-app-gracefully
============================
目前在開發的系統是需要提供長連結的 socket server，利用 cluster 來善用多核心，假設一台 8 核心的 server 可供 30 萬 clients 連線，換版的時候必須要停下 nodejs 城式重新啟動，但目前的架構是在連進這個系統之前，必須到 web server 去要求一些 web service，如果同時有 30 萬個 request 去灌 web server，勢必會對 web server 提供的其他服務造成壓力。

這時候就可以利用 cluster 的功能去做到優雅的換版。

這邊提供一個範例程式，start.js 與 cworker.js，cworker.js 是一個 socket server，重點在於 start.js。

start.js 中會由一個 master 去啟動 n 個 worker，worker 這邊，會監聽 SIGUSR2，這邊的訊號大家可以自己決定要用哪一個，在接收到這個訊號後，可以處理一些關閉前應該要做的事情，例如通知使用者切斷連線。事情都做完後，就用 process.exit(2) 來關閉這個 process，這個時候 master 會接收到 cluster worker 關閉的事件，如果 code 是等於 2 的話，就重新啟動一個 worker。

```
kill -s SIGUSR2 pid
```
如此一來，就可以逐步慢慢地替換程式，而不對其他系統造成負擔，不過對於使用者來說，可能會覺得被中斷了幾次，不過由於我們的 client 端系統會在私底下做這些重新連接的動作，所以影響就不是很大。

worker
```
process.on('SIGUSR2', function() {
  // do something for closing
  worker.close();
  process.exit(2);
});
```
master
```
cluster.on('exit', function(worker, code, signal) {
  console.log('[Master]', 'worker ' + worker.id + "-" + worker.process.pid + ' died, code:' + code + ' signal:' + signal);
  if(code == 2) {
    // if code is 2, restart a worker
    cluster.fork();
  }
});
```
