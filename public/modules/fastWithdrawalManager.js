const { app, shell } = require("electron");
const { EventEmitter } = require('events');
const axios = require("axios");


class FastWithdrawalManager extends EventEmitter {
  // Fast withdrawal server config
  FAST_WITHDRAW_SERVER = 'http://172.105.148.135:3333';
  constructor() {
    super();
    this.rpcConfigBTC = {
      host: '127.0.0.1',
      port: 38332,
      user: 'user',
      password: 'password'
    };
  }

  async makeRpcCallBTC(method, params = []) {
    try {
      const response = await axios.post(`http://${this.rpcConfigBTC.host}:${this.rpcConfigBTC.port}`, {
        jsonrpc: '1.0',
        id: 'fastwithdrawal',
        method,
        params
      }, {
        auth: {
          username: this.rpcConfigBTC.user,
          password: this.rpcConfigBTC.password
        }
      });
      return response.data.result;
    } catch (error) {
      console.error(`RPC call failed (${method}):`, error.message);
      throw error;
    }
  }

  async getBalanceBTC() {
    try {
      const info = await this.makeRpcCallBTC('getbalance');
      console.debug("getbalance response: ", info)
      return {
        info
      };
    } catch (error) {
      console.error('Failed to get BTC balance:', error);
      throw error;
    }
  }

  async requestWithdrawal(destination, amount, layer2Chain) {
    try {
      const response = await axios.post(`${this.FAST_WITHDRAW_SERVER}/withdraw`, {
        withdrawal_destination: destination,
        withdrawal_amount: amount.toString(), // Server expects string
        layer_2_chain_name: layer2Chain // "Thunder" or "BitNames"
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.error || 'Withdrawal request failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to request withdrawal:', error);
      throw error;
    }
  }

  async notifyPaymentComplete(hash, txid) {
    try {
      const response = await axios.post(`${this.FAST_WITHDRAW_SERVER}/paid`, {
        hash: hash,
        txid: txid
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.error || 'Payment notification failed');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to notify payment:', error);
      throw error;
    }
  }
}

module.exports = FastWithdrawalManager;
