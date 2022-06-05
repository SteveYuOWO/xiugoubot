# 修勾 Bot

## 策略机器人

使用 github actions 进行每小时进行触发指定策略，如果符合，则推送至钉钉。

## 如何使用

`accessToken` 和 `secret` 来源是自定义钉钉群机器人。

1. 本地运行

```
accessToken=<Your Token> secret=<Your Secret>
```

2. fork 本仓库到自己仓库，修改 fork 仓库中 github secret 的 `accessToken` 和 `secret`，程序会自动使用 `github actions` 进行每隔 1 小时运行一次推送。

## 策略

选择币安的现货、期货所有小币种，按差值的绝对值从大到小排列。

小币种（期货价格小于 500）

评级：

```
let level = 'D';
if(weight > 0.1) level = 'C';
if(weight > 1) level = 'B';
if(weight > 5) level = 'A';
if(weight > 10) level = 'S';
```
