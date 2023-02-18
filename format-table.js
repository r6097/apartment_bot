const { Table } = require('embed-table');

/**
 * Turns rent dues spreadsheet data into table
 * @param {Array} paymentList - array of strings representing rent dues
 * @returns {Object Table} - Formatted fields to be used in EmbedBuilder
 */
const rentTable = (paymentList) => {
  // Consolidate data
  let roommates = process.env['ROOMMATES'].split(',');
  let tableData = roommates.map((x, i) => [x, paymentList[i]]);
  console.log(tableData)

  const table = new Table({
    titles: ["Name", "Amount Due"],
    titleIndexes: [0, 10],
    columnIndexes: [0, 10],
    start: '`',
    end: '`',
    padEnd: 3
  });

  tableData.forEach((dataRow) => {
    table.addRow(dataRow)
  });

  return table.toField();
};

/**
  * Turns chore spreadsheet data into table
  * @param {Array} response - array of strings representing discord ids and chore counters
  * @returns {Object Table} - Formatted fields to be used in EmbedBuilder
  */
const choresTable = (response) => {
  
  const table = new Table({
    titles: response.values[0],
    titleIndexes: [0, 27, 32, 37, 42, 47],
    columnIndexes: [0, 20, 23, 26, 29, 32],
    start: '`',
    end: '`',
    padEnd: 3
  });

  response.values.slice(1).forEach((dataRow) => {
    table.addRow(dataRow)
  });

  return table.toField();
}

module.exports = {
	rentTable,
  choresTable,
};