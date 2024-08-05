let token = '';
const baseUrl = 'https://api.up.com.au/api/v1';

const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const budgetSheet = spreadsheet.getSheetByName('Budget');
const transactionsSheet = spreadsheet.getSheetByName('Transactions');

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1; // getMonth() returns a zero-based value (0-11)

const getPriority = (id) => {
  const priority = {
    "investments": "savings",
    "family": "needs",
    "groceries": "needs",
    "internet": "needs",
    "health-and-medical": "needs",
    "rent-and-mortgage": "needs",
    "utilities": "needs",
    "mobile-phone": "needs",
    "car-insurance-and-maintenance": "needs",
    "education-and-student-loans": "needs",
    "fuel": "needs",
    "public-transport": "needs",
    "home-insurance-and-rates": "needs",
    "car-repayments": "needs",
    "parking": "needs",
    "toll-roads": "needs",
    "life-admin": "needs",
    "games-and-software": "wants",
    "good-life": "wants",
    "booze": "wants",
    "clothing-and-accessories": "wants",
    "cycling": "wants",
    "homeware-and-appliances": "wants",
    "personal": "wants",
    "events-and-gigs": "wants",
    "home": "wants",
    "fitness-and-wellbeing": "wants",
    "hobbies": "wants",
    "home-maintenance-and-improvements": "wants",
    "transport": "wants",
    "gifts-and-charity": "wants",
    "holidays-and-travel": "wants",
    "pets": "wants",
    "hair-and-beauty": "wants",
    "lottery-and-gambling": "wants",
    "pubs-and-bars": "wants",
    "taxis-and-share-cars": "wants",
    "restaurants-and-cafes": "wants",
    "takeaway": "wants",
    "tobacco-and-vaping": "wants",
    "news-magazines-and-books": "wants",
    "tv-and-music": "wants",
    "adult": "wants",
    "technology": "wants",
  };
  return priority[id];
};

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Budget Up')
      .addItem('Sync Transactions', 'BudgetUp.syncTransactions')
      .addToUi();
}

function prefixZero(number) {
  return number < 10 ? "0" + number : number.toString();
}

function calculateDays(year, month) {
  const untilLastDay = prefixZero(new Date(year, month, 0).getDate());
  const sinceYear = month === 1 ? year - 1 : year;
  const sinceMonth = month === 1 ? 12 : month - 1;
  const sinceMonthLastDay = prefixZero(new Date(sinceYear, sinceMonth, 0).getDate());
  console.log(`[calculateDays] ${sinceYear} ${sinceMonth} ${sinceMonthLastDay} ${untilLastDay}`);
  return { sinceYear, sinceMonth, sinceMonthLastDay, untilLastDay };
}

function getTransactionAccount() {
  const url = `${baseUrl}/accounts`;
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  const response = UrlFetchApp.fetch(url, options);
  const accounts = JSON.parse(response.getContentText());
  
  for (const account of accounts.data) {
    if (account.attributes.accountType === "TRANSACTIONAL") {
      const accountId = account.id;
      const accountBalance = Math.abs(account.attributes.balance.valueInBaseUnits / 100);
      console.log(`[getTransactionAccount] account found { ${accountId}, ${accountBalance} }`);
      return { accountId, accountBalance };
    }
  }

  console.log(`[getTransactionAccount] account failed`);
  return { accountId: null, accountBalance: null };
};

function fetchCategories() {
  const categories = {};
  const url = `${baseUrl}/categories`;
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  const response = UrlFetchApp.fetch(url, options);
  const upCategories = JSON.parse(response.getContentText());
  
  for (const category of upCategories.data) {
    if (category.type !== "categories") continue;
    if (category.relationships.parent.data === null) continue;
    categories[category.id] = {
      id: category.id,
      name: category.attributes.name,
      priority: getPriority(category.id),
      parent: category.relationships.parent.data?.id || "",
    };
  }
  return categories;
};

function fetchTransactions (categories, url) {
  const transactions = [];
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  const response = UrlFetchApp.fetch(url, options);
  const upTransactions = JSON.parse(response.getContentText());
  for (const transaction of upTransactions.data) {
    if (transaction.type !== "transactions") continue;
    const transactionCategory = transaction.relationships?.category?.data?.id;
    transactions.push({
      id: transaction.id,
      date: transaction.attributes.createdAt,
      name: transaction.attributes.description,
      flow: Math.sign(transaction.attributes.amount.valueInBaseUnits) === -1 ? "outgoing" : "incoming",
      value: Math.abs(transaction.attributes.amount.valueInBaseUnits / 100),
      category: transaction.attributes.description === "Transfer to Savings" ? "Investments" : transactionCategory === undefined ? "" : categories[transactionCategory].name,
      status: transaction.attributes.status.toLowerCase(),
      settled: transaction.attributes.settledAt,
    });
  }
  const next = upTransactions.links.next;
  return { url: next, transactions };
};

function writeAccountBalance(balance) {
  budgetSheet.getRange("D4").setValue(balance); 
};

function readCarryOver() {
  return budgetSheet.getRange("B5").getValue();
}

function writeTransactions(rows) {
  transactionsSheet.getRange(1, 1, 1, 7).setValues([['Date', 'Name', 'Flow', 'Value', 'Category', 'Status', 'Settled']]); 
  transactionsSheet.getRange(2, 1, rows.length, 7).setValues(rows);
};

function syncTransactions() {
  console.log(`[syncTransactions] starting script for year: ${year}, month: ${month}`);
  const ui = SpreadsheetApp.getUi();

  const result = ui.prompt(
      'Please enter your Up API Key:',
      ui.ButtonSet.OK_CANCEL);

  const button = result.getSelectedButton();
  const userToken = result.getResponseText();
  
  if (button == ui.Button.CANCEL) {
    return false;
  }
  
  if(userToken.length <= 0) {
    ui.alert(
    'Up API Key Missing!',
    'Are you sure you set a correct key?');
    return false;
  }

  token = userToken;
  const { sinceYear, sinceMonth, sinceMonthLastDay, untilLastDay } = calculateDays(year, month);
  const since = `${sinceYear}-${prefixZero(sinceMonth)}-${sinceMonthLastDay}T13:00:00.001Z`;
  const until = `${year}-${prefixZero(month)}-${untilLastDay}T13:00:00.001Z`;
  console.log(`[syncTransactions] since: ${since}, until: ${until}`);

  const transactionAccount = getTransactionAccount();
  if(transactionAccount.accountId === null && transactionAccount.accountBalance === null) {
    ui.alert('Invalid Account Data');
    throw new Error('Invalid Account Data');
  }
  const { accountId, accountBalance } = transactionAccount;
  writeAccountBalance(accountBalance);

  const categories = fetchCategories();

  let url = `${baseUrl}/accounts/${accountId}/transactions?page[size]=100&filter[since]=${since}&filter[until]=${until}`;
  let transactions = [];
  do {
  console.log(`[syncTransactions] url: ${url}`);
    const upTransactions = fetchTransactions(categories, url);
    url = upTransactions.url;
    transactions = [ ...transactions, ...upTransactions.transactions];
  } while (url !== null);
  
  const rows = transactions.map(function(transaction) {
    return [transaction.date, transaction.name, transaction.flow, transaction.value, transaction.category, transaction.status, transaction.settled];
  });

  const carryOver = readCarryOver();
  if(carryOver >= 0) {
    rows.push([since, "Carry Over", "incoming", carryOver, "", "settled", since]);
  }

  writeTransactions(rows);

  console.log(`[syncTransactions] done`);
}




