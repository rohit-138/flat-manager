import Swal from "sweetalert2";

export function showExpenseInfo(expense) {

  console.log("Expenses --> ", expense)
  const splitRows = expense.splits.map(
    s => `
      <tr>
        <td>${s.payer}</td>
        <td style="text-align:right">₹${s.amount}</td>
        <td>${s.state}</td>
      </tr>
    `
  ).join("");

  Swal.fire({
    title: expense.title,
    width: 450,
    html: `
      <p><b>Creator:</b> ${expense.creator}</p>
      <p><b>Total:</b> ₹${expense.total_amount}</p>
            <p><b>State:</b> ₹${expense.state}</p>

      <hr/>
      <table style="width:100%">
        <thead>
          <tr>
            <th align="left">Person</th>
            <th align="right">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${splitRows}
        </tbody>
      </table>
    `,
    confirmButtonText: "Close",
  });
}
