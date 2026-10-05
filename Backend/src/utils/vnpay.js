import crypto from 'crypto';
import qs from 'qs';

export function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export function generateVnpayUrl(req, orderId, amount, orderInfo, returnUrl) {
  let date = new Date();
  
  // VNPAY require format YYYYMMDDHHmmss
  const pad = (n) => n < 10 ? '0' + n : n;
  
  // Adjust for VN time (GMT+7)
  const vnTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const vnYear = vnTime.getUTCFullYear();
  const vnMonth = pad(vnTime.getUTCMonth() + 1);
  const vnDate = pad(vnTime.getUTCDate());
  const vnHours = pad(vnTime.getUTCHours());
  const vnMinutes = pad(vnTime.getUTCMinutes());
  const vnSeconds = pad(vnTime.getUTCSeconds());
  
  const createDate = `${vnYear}${vnMonth}${vnDate}${vnHours}${vnMinutes}${vnSeconds}`;

  // Expire date (15 mins later)
  let expireDateObj = new Date(vnTime.getTime() + 15 * 60 * 1000);
  const expYear = expireDateObj.getUTCFullYear();
  const expMonth = pad(expireDateObj.getUTCMonth() + 1);
  const expDate = pad(expireDateObj.getUTCDate());
  const expHours = pad(expireDateObj.getUTCHours());
  const expMinutes = pad(expireDateObj.getUTCMinutes());
  const expSeconds = pad(expireDateObj.getUTCSeconds());
  const expireDate = `${expYear}${expMonth}${expDate}${expHours}${expMinutes}${expSeconds}`;

  let ipAddr = '127.0.0.1';

  let tmnCode = process.env.VNP_TMN_CODE;
  let secretKey = process.env.VNP_HASH_SECRET;
  let vnpUrl = process.env.VNP_URL;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = Math.round(amount * 100);
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_ExpireDate'] = expireDate;

  vnp_Params = sortObject(vnp_Params);

  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl;
}

export function verifyVnpayReturn(vnp_Params) {
  let secureHash = vnp_Params['vnp_SecureHash'];
  
  // Lọc ra chỉ các tham số bắt đầu bằng vnp_
  let vnp_Params_Filtered = {};
  for (let key in vnp_Params) {
    if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
      vnp_Params_Filtered[key] = vnp_Params[key];
    }
  }

  vnp_Params_Filtered = sortObject(vnp_Params_Filtered);
  let secretKey = process.env.VNP_HASH_SECRET;
  let signData = qs.stringify(vnp_Params_Filtered, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  return secureHash === signed;
}
