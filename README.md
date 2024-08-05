# Budget for Up

This script is to be used with this [Budgeting](https://docs.google.com/spreadsheets/d/1z37QL73VHK6C6c4Db433_kNxoLXwTPXcb7SRG6eOnvQ/edit?usp=sharing) spreadsheet. Feel free to duplicate this spreadsheet into your drive.

## Requirements

- Google Drive & Sheets
- [Up Bank & API Key](https://developer.up.com.au/)

## Usage

- Duplicate the [sheet](https://docs.google.com/spreadsheets/d/1z37QL73VHK6C6c4Db433_kNxoLXwTPXcb7SRG6eOnvQ/edit?usp=sharing) into your drive.
- Go to `Extentions` > `Apps Script`
- Paste the contents of [main.js](https://github.com/nilesuan/budget-up/blob/main/main.js) into the page and save
- Reload your sheet
- If everything went right, there should be a menu named `Budget Up` right beside your `Extensions` and `Help`
- Use `Sync Transactions` to pull down the transactions of the month into the `transactions` sheet
- Customise as necessary

## How it works

This sheet works like YNAB, you budget not for the future but what you currently have. Say you have $1000 in the bank, you distribute it throughout the categories on the Budget sheet.
Budget will then reflect once you sync the transactions.

Say you budgeted `$100` on `Takeaway` and the next day you eat out for `$20`, the `Budgeted` column will still have `$100`, `$20` will reflect on the `Activity` column. It will then tell you, you can only sped `$80` more for `Takeaway` on the `Available` column.

## Notes

- This script does not store your UP API Key, so it will always ask for it every execution
- This is written for monthly budgeting, customise it if you want weekly or fortnightly
- This only pulls in the current value in the transactions account and not the other savings
- The categories on the budget are up categories so make sure you go to your Up app and put categories into your transactions
- There is a cell called `Cary Over` on Budget sheet B5, put your previous months amount there
