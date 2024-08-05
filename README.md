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

  ## Notes

  - This script does not store your UP API Key, so it will always ask for it every execution
