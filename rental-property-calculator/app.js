function resetDownPaymentPercentage() {
	var downpayment_percent = 20;
	var principal_amount = document.querySelector("#principal_amount").value.replaceAll(',','');
	if (principal_amount == null) {
	  principal_amount = 0;
    }

	var downpayment_amount = ((parseFloat(principal_amount))*downpayment_percent)/100;
	document.getElementById("down_payment").value = numberWithCommas(Math.round(downpayment_amount));
  	document.querySelector("#down-payment-pct").innerHTML = Math.round(downpayment_percent);

	var closing_costs = ((principal_amount*3)/100);
	document.getElementById("closing_costs").value = numberWithCommas(closing_costs.toFixed(2));
}

function Calculate() {
  var principal_amount = document.querySelector("#principal_amount").value.replaceAll(',','');
  const interest_rate = document.querySelector("#interest_rate").value;
  const length_of_loan = document.querySelector("#length_of_loan").value;

  if (principal_amount == null) {
	  principal_amount = 0;
  }

  /*advance option closing costs*/
  const currentClosingCost = document.getElementById("closing_costs").value.replaceAll(',','');
  var closingCostPercentage = 3;
  if (currentClosingCost != null) {
    closingCostPercentage = parseFloat(currentClosingCost)*100/parseFloat(principal_amount);
  } else {
    closingCostPercentage = 3;
  }

  var closing_costs_amount = ((parseFloat(principal_amount))*closingCostPercentage)/100;
  document.getElementById("closing_costs").value = numberWithCommas(Math.round(closing_costs_amount));

  var downpayment_percent = 10/100;
  const currDownPaymentValue = document.getElementById("down_payment").value.replaceAll(',','');

  if (currDownPaymentValue != null) {
     downpayment_percent = parseFloat(currDownPaymentValue)*100/parseFloat(principal_amount);
    if (downpayment_percent >= 100) {
       downpayment_percent=100;
     }
  } else {
    downpayment_percent = 20;
  }

  var downpayment_amount = ((parseFloat(principal_amount))*downpayment_percent)/100;

  document.getElementById("down_payment").value = numberWithCommas(Math.round(downpayment_amount));
  document.querySelector("#down-payment-pct").innerHTML = Math.round(downpayment_percent);

  document.getElementById("loan_amount").value = numberWithCommas(parseFloat(principal_amount)-downpayment_amount);
  document.getElementById("loan-amount-pct").innerHTML = Math.round(100 - downpayment_percent);

  //const months = length_of_loan*12;

  //Calculating interest per month
  //const interest = (principal_amount * (interest_rate * 0.01)) / months;

  //Calculating total payment
  //const total = ((principal_amount / months) + interest).toFixed(2);

  var downpayment = downpayment_amount;


  const p = principal_amount-downpayment;
  const r = interest_rate / (12 * 100); // one month interest
  const t = length_of_loan * 12; // one month period

  const emi = (p * r * Math.pow(1 + r, t)) / (Math.pow(1 + r, t) - 1);

  document.getElementById("principal_and_interest").value = numberWithCommas(emi.toFixed(2));

  //Amortization_schedule_fun(p,r,t,emi);
  advanced_option_Calculate_fun();

  monthly_rent_Calculate_fun();
  cash_flow_Calculate_fun(principal_amount,emi);

  Ratios_Calculate_fun(emi);

  drawChart(emi.toFixed(2));

  shouldResetDownPayment = false;
  //break_even_Calculate_fun(p,r,t,emi);
  graphChart(principal_amount,length_of_loan,emi);
}

function slider_to_amount_fun() {
  var principal_amount_slider  = document.getElementById("principal_amount_slider").value;
  document.getElementById("principal_amount").value = numberWithCommas(principal_amount_slider);
  document.getElementById("principal_amount_2").value = numberWithCommas(principal_amount_slider);
}

function amount_to_slider_fun() {
  var principal_amount  = document.getElementById("principal_amount").value.replaceAll(',','');
  document.getElementById("principal_amount_slider").value = principal_amount;
  jQuery("#principal_amount_slider").trigger('change');
  document.getElementById("principal_amount_2").value = numberWithCommas(principal_amount);
}

function amount_to_slider_fun_2() {
  var principal_amount  = document.getElementById("principal_amount_2").value.replaceAll(',','');
  document.getElementById("principal_amount_slider").value = principal_amount;
  jQuery("#principal_amount_slider").trigger('change');
  document.getElementById("principal_amount").value = numberWithCommas(principal_amount);
}




/*function slider_to_amount1_fun() {
  var principal_amount_slider1  = document.getElementById("principal_amount_slider1").value;
  document.getElementById("principal_amount1").value = numberWithCommas(principal_amount_slider1);
}

function amount_to_slider1_fun() {
  var principal_amount1  = document.getElementById("principal_amount1").value.replaceAll(',','');
  document.getElementById("principal_amount_slider1").value = principal_amount1;
  jQuery("#principal_amount_slider1").trigger('change');
}*/



function monthly_rent_slider_fun() {
  var monthly_rent_slider  = document.getElementById("monthly_rent_slider").value;
  document.getElementById("monthly_rent").value = numberWithCommas(monthly_rent_slider);
  monthly_rent_Calculate_fun();
  document.getElementById("monthly_rent_2").value = numberWithCommas(monthly_rent_slider);
}

function monthly_rent_to_slider_fun() {
  var monthly_rent  = document.getElementById("monthly_rent").value.replaceAll(',','');
  document.getElementById("monthly_rent_2").value = numberWithCommas(monthly_rent);
  monthly_rent_Calculate_fun();
  document.getElementById("monthly_rent_slider").value = monthly_rent;
  jQuery("#monthly_rent_slider").trigger('change');
}

function monthly_rent_2_to_slider_fun() {
  var monthly_rent  = document.getElementById("monthly_rent_2").value.replaceAll(',','');
  document.getElementById("monthly_rent").value = numberWithCommas(monthly_rent);
  monthly_rent_Calculate_fun();
  document.getElementById("monthly_rent_slider").value = monthly_rent;
  jQuery("#monthly_rent_slider").trigger('change');
}


function monthly_rent_Calculate_fun() {
  //var principal_amount  = document.getElementById("principal_amount").value;

  //document.getElementById("monthly_rent").value = (principal_amount*0.01).toFixed(2);
  var monthly_rent  = document.getElementById("monthly_rent").value.replaceAll(',','');
  /*document.getElementById("vacant").value = (monthly_rent*0.05).toFixed(2);
  document.getElementById("output_vacancy").innerHTML = "$"+(monthly_rent*0.05).toFixed(2);*/
  var vacant = document.getElementById("vacant").value.replaceAll(',','');
  //document.getElementById("output_vacancy").innerHTML =vacant.replaceAll(',','');

  var other_monthly_income  = document.getElementById("other_monthly_income").value.replaceAll(',','');
  var net_monthly_rent = parseFloat(monthly_rent)+parseFloat(other_monthly_income)-parseFloat(vacant);
  document.getElementById("net_monthly_rent").value = numberWithCommas(net_monthly_rent.toFixed(2));
  //document.getElementById("gross_rent").innerHTML = "$"+numberWithCommas((parseFloat(monthly_rent)+parseFloat(other_monthly_income)).toFixed(2));
}

function cash_flow_Calculate_fun(PA,emi) {

  var net_monthly_rent  = document.getElementById("net_monthly_rent").value.replaceAll(',','');

  /*const property_state = document.querySelector("#property_state").value;
  var taxes = ((PA*property_state)/100)/12;
  document.getElementById("taxes").value = taxes.toFixed(2);*/
  var taxes = document.getElementById("taxes").value.replaceAll(',','');
  var property_insurance  = document.getElementById("property_insurance").value.replaceAll(',','');
  var property_management  = document.getElementById("property_management").value.replaceAll(',','');
  var maintenance  = document.getElementById("maintenance").value.replaceAll(',','');
  var hoa_fees  = document.getElementById("hoa_fees").value.replaceAll(',','');
  var utilities  = document.getElementById("utilities").value.replaceAll(',','');
  var other_costs  = document.getElementById("other_costs").value.replaceAll(',','');

  var sum = parseFloat(taxes)+parseFloat(property_insurance)+parseFloat(property_management)+parseFloat(maintenance)+parseFloat(hoa_fees)+parseFloat(utilities)+parseFloat(other_costs);

  const net_operating_income = parseFloat(net_monthly_rent)-parseFloat(sum);
  const net_cash_flow = parseFloat(net_operating_income)-parseFloat(emi);

  document.getElementById("gross_cash_flow").innerHTML = "$"+numberWithCommas(net_monthly_rent);
  document.getElementById("operating_expenses").innerHTML = "$"+numberWithCommas(sum.toFixed(2));
  document.getElementById("cash_flow").innerHTML = "$"+numberWithCommas(net_cash_flow.toFixed(2));
  document.getElementById("mortgage_principal_and_interest").innerHTML = "$"+numberWithCommas(emi.toFixed(2));
  document.getElementById("net_operating_income").innerHTML = "$"+numberWithCommas(net_operating_income.toFixed(2));
  document.getElementById("net_operating_income").setAttribute("value", net_operating_income.toFixed(2));

  var sum_total = parseFloat(emi)+parseFloat(sum);
  // pie chart expenses
  document.getElementById("piechart_Loan_Payments").innerHTML = "$"+numberWithCommas(emi.toFixed(2));
  document.getElementById("piechart_Property_Taxes").innerHTML = "$"+document.getElementById("taxes").value;
  document.getElementById("piechart_Property_Insurance").innerHTML = "$"+document.getElementById("property_insurance").value;
  document.getElementById("piechart_Property_Management").innerHTML = "$"+document.getElementById("property_management").value;
  document.getElementById("piechart_Maintenance").innerHTML = "$"+document.getElementById("maintenance").value;
  document.getElementById("piechart_HOA_Fees").innerHTML = "$"+document.getElementById("hoa_fees").value;
  document.getElementById("piechart_Utilities").innerHTML = "$"+document.getElementById("utilities").value;
  document.getElementById("piechart_Other_Expences").innerHTML = "$"+document.getElementById("other_costs").value;
  document.getElementById("piechart_Total_Monthly_Operating_Expenses").innerHTML = "$"+numberWithCommas(sum_total.toFixed(2));
  document.getElementById("monthly_expenses_total_for_pie").innerHTML = "$"+numberWithCommas(sum_total.toFixed(2));

}


function advanced_option_Calculate_fun() {
  var principal_amount = document.querySelector("#principal_amount").value.replaceAll(',','');
  const rehab_cost = document.querySelector("#rehab_cost").value.replaceAll(',','');
  if (rehab_cost != 0 && rehab_cost != '') {
      var after_repair_value = parseFloat(principal_amount)+parseFloat(rehab_cost);
      document.getElementById("after_repair_value").value = numberWithCommas(after_repair_value.toFixed(2));
  }else{
      document.getElementById("after_repair_value").value = 0;
  }
}


function property_state_taxes_Calculate_fun() {
  var principal_amount = document.querySelector("#principal_amount").value.replaceAll(',','');
  const property_state = document.querySelector("#property_state").value;

  //var taxes = Math.round(((PA*property_state)/100)/12);
  var taxes = ((principal_amount*property_state)/100)/12;
  document.getElementById("taxes").value = numberWithCommas(taxes.toFixed(2));
}

function vacant_Calculate_fun() {
  var monthly_rent  = document.getElementById("monthly_rent").value.replaceAll(',','');
  document.getElementById("vacant").value = numberWithCommas((monthly_rent*0.05).toFixed(2));
  //document.getElementById("output_vacancy").innerHTML = "$"+numberWithCommas((monthly_rent*0.05).toFixed(2));
}


function monthly_rent_percent_0f_PA_Calculate_fun() {
  var principal_amount  = document.getElementById("principal_amount").value.replaceAll(',','');
  document.getElementById("monthly_rent").value = numberWithCommas((principal_amount*0.01).toFixed(2));
  document.getElementById("monthly_rent_2").value = numberWithCommas((principal_amount*0.01).toFixed(2));
  document.getElementById("monthly_rent_slider").value = (principal_amount*0.01).toFixed(2);
  jQuery("#monthly_rent_slider").trigger('change');
}


function Ratios_Calculate_fun(emi) {

  var principal_amount = document.querySelector("#principal_amount").value.replaceAll(',','');
  const length_of_loan = document.querySelector("#length_of_loan").value;

  var closing_costs = document.querySelector("#closing_costs").value.replaceAll(',','');
  var rehab_cost = document.querySelector("#rehab_cost").value.replaceAll(',','');
  var down_payment = document.querySelector("#down_payment").value.replaceAll(',','');
  if (rehab_cost =="") {rehab_cost = 0;}

  var monthly_rent  = document.getElementById("monthly_rent").value.replaceAll(',','');
  var other_monthly_income  = document.getElementById("other_monthly_income").value.replaceAll(',','');
  var vacant  =document.getElementById("vacant").value.replaceAll(',','');

  /*const property_state = document.querySelector("#property_state").value;
  var taxes = (principal_amount*property_state)/100;*/

  var taxes = document.getElementById("taxes").value.replaceAll(',','');

  var property_insurance  = document.getElementById("property_insurance").value.replaceAll(',','');
  var property_management  = document.getElementById("property_management").value.replaceAll(',','');
  var maintenance  = document.getElementById("maintenance").value.replaceAll(',','');
  var hoa_fees  = document.getElementById("hoa_fees").value.replaceAll(',','');
  var utilities  = document.getElementById("utilities").value.replaceAll(',','');
  var other_costs  = document.getElementById("other_costs").value.replaceAll(',','');

  var Annual_monthly_rent = monthly_rent*12;
  var Annual_vacant = vacant*12;
  var Annual_gross_rent = Annual_monthly_rent-Annual_vacant;

  var Annual_taxes = taxes*12;
  var Annual_property_insurance = property_insurance*12;
  var Annual_property_management = property_management*12;
  var Annual_maintenance = maintenance*12;
  var Annual_hoa_fees = hoa_fees*12;
  var Annual_utilities = utilities*12;

  var Annual_emi = emi*12;

  var monthly_operating_expenses = parseFloat(taxes)+parseFloat(property_insurance)+parseFloat(property_management)+parseFloat(maintenance)+parseFloat(hoa_fees)+parseFloat(utilities)+parseFloat(other_costs);


  var operating_expenses = parseFloat(Annual_taxes)+parseFloat(Annual_property_insurance)+parseFloat(Annual_property_management)+parseFloat(Annual_maintenance)+parseFloat(Annual_hoa_fees)+parseFloat(Annual_utilities)+parseFloat(other_costs);
  const Annual_net_operating_income = (parseFloat(Annual_gross_rent)-parseFloat(operating_expenses));
  const Annual_cumulative_cashflow = (parseFloat(Annual_net_operating_income)-parseFloat(Annual_emi));

  var total_cash_investment =parseFloat(closing_costs)+parseFloat(rehab_cost)+parseFloat(down_payment);
  var cash_on_cash_return = (Annual_cumulative_cashflow/total_cash_investment)*100;

  var break_even_point  = total_cash_investment/Annual_cumulative_cashflow;

  var cap_rate = 0.00;
   // if (rehab_cost !="" && rehab_cost !=0) {
    cap_rate = (Annual_net_operating_income/(parseFloat(rehab_cost)+parseFloat(principal_amount)))*100;
    //}

  var rule_1 = (parseFloat(monthly_operating_expenses)+parseFloat(vacant))/(parseFloat(monthly_rent)+parseFloat(other_monthly_income))*100;
  var rule_2 = (monthly_rent/principal_amount)*100;


  document.getElementById("ratios_cash_flow").value = numberWithCommas(Annual_cumulative_cashflow.toFixed());
  document.getElementById("ratios_NOI").value = numberWithCommas(Annual_net_operating_income.toFixed());
 // document.getElementById("ratios_ROI").value = numberWithCommas(operating_expenses.toFixed(2));
 // document.getElementById("ratios_break_even_point").value = break_even_point.toFixed(2);
  document.getElementById("ratios_cash_on_Cash_return").value = cash_on_cash_return.toFixed(2)+"%";
  document.getElementById("ratios_cap_rate").value = cap_rate.toFixed(2)+"%";

  document.getElementById("ratios_50_percent_rule").value = rule_1.toFixed(2)+"%";
  document.getElementById("ratios_1_percent_rule").value = rule_2.toFixed(2)+"%";
  if (rule_1<=50) {
    document.getElementById("ratios_50_percent_rule").style.color = "green";
  }else{
    document.getElementById("ratios_50_percent_rule").style.color = "red";
  }

  if (rule_2<1) {
    document.getElementById("ratios_1_percent_rule").style.color = "red";
  }else{
    document.getElementById("ratios_1_percent_rule").style.color = "green";
  }

  document.getElementById("UpFront_cash_Investment").innerHTML = "$"+numberWithCommas(total_cash_investment);

}

//console.log(numberWithCommas(1234567890));
function numberWithCommas(x) {
    //var x=123456524578;

    x=x.toString();
    var parts = x.toString().split(".");

    var lastThree = parts[0].substring(parts[0].length-3).replaceAll(',','');
    //var otherNumbers = parts[0].substring(0,parts[0].length-3).replaceAll(',','');
    var otherNumbers = parts[0].replaceAll(',','');
    //console.log(otherNumbers);
    if(otherNumbers != ''){
      lastThree = ',' + lastThree;
    }
    parts[0] = otherNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",") ;


    return parts.join(".");

}



/*function break_even_Calculate_fun(p,r,t,emi) {

  const length_of_loan = t/12;

  var monthly_rent  = document.getElementById("monthly_rent").value;
  var vacant  =document.getElementById("vacant").value;

  const property_state = document.querySelector("#property_state").value;
  var taxes = (p*property_state)/100;

  var property_insurance  = document.getElementById("property_insurance").value;
  var property_management  = document.getElementById("property_management").value;
  var maintenance  = document.getElementById("maintenance").value;
  var hoa_fees  = document.getElementById("hoa_fees").value;
  var utilities  = document.getElementById("utilities").value;
  var other_costs  = document.getElementById("other_costs").value;

var Annual_monthly_rent = monthly_rent*12;
var Annual_vacant = vacant*12;
var Annual_gross_rent =0;

var Annual_taxes = taxes;
var Annual_property_insurance = property_insurance*12;
var Annual_property_management = property_management*12;
var Annual_maintenance = maintenance*12;
var Annual_hoa_fees = hoa_fees*12;
var Annual_utilities = utilities*12;

var Annual_emi = emi*12;

var result_sum1 = '';
var result_sum2 = '';

  for (i = 1; i <= length_of_loan; i++) {
    Annual_monthly_rent = Annual_monthly_rent + (Annual_monthly_rent*0.03);
    Annual_vacant = Annual_vacant + (Annual_vacant*0.03);
    Annual_gross_rent = Annual_monthly_rent-Annual_vacant;

    Annual_taxes = Annual_taxes + (Annual_taxes*0.03);
    Annual_property_insurance = Annual_property_insurance + (Annual_property_insurance*0.03);
    Annual_property_management = Annual_property_management + (Annual_property_management*0.03);
    Annual_maintenance = Annual_maintenance + (Annual_maintenance*0.03);
    Annual_hoa_fees = Annual_hoa_fees + (Annual_hoa_fees*0.03);
    Annual_utilities = Annual_utilities + (Annual_utilities*0.03);

   var operating_expenses = parseFloat(Annual_taxes)+parseFloat(Annual_property_insurance)+parseFloat(Annual_property_management)+parseFloat(Annual_maintenance)+parseFloat(Annual_hoa_fees)+parseFloat(Annual_utilities)+parseFloat(other_costs);

   var Annual_net_operating_income = (parseFloat(Annual_gross_rent)-parseFloat(operating_expenses)).toFixed(2);

   var Annual_cumulative_cashflow = (parseFloat(Annual_net_operating_income)-parseFloat(Annual_emi)).toFixed(2);

   result_sum1 += '{ label: "year '+i+'", y: '+Annual_net_operating_income+' },';
   result_sum2 += '{ label: "year '+i+'", y: '+Annual_cumulative_cashflow+' },';
    //console.log("year "+i+"-"+Annual_cumulative_cashflow);

  }

console.log(result_sum1);



}


function Amortization_schedule_fun(p,r,t,emi) {

var total_emi = 0;
var total_monthly_principal = 0;
var total_monthly_interest = 0;
var html = '';


for (i = 1; i <= t; i++) {


const monthly_interest = (p*r);

const monthly_principal =  (emi-monthly_interest);

p = (p-monthly_principal);


var  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var dt = new Date();
dt.setMonth( dt.getMonth() + i );

var datestr = months[dt.getMonth()] +' '+ dt.getDate()  +' '+ dt.getFullYear();
var mountCount = dt.getMonth();

total_emi = parseFloat(emi)+parseFloat(total_emi);
total_monthly_principal = parseFloat(monthly_principal)+parseFloat(total_monthly_principal);
total_monthly_interest = parseFloat(monthly_interest)+parseFloat(total_monthly_interest);


total_monthly_principal

html += '<tr>'+
    '<td>'+datestr+'</td>'+
    '<td>$'+emi.toFixed(2)+'</td>'+
    '<td>$'+monthly_principal.toFixed(2)+'</td>'+
    '<td>$'+monthly_interest.toFixed(2)+'</td>'+
    '<td>$'+p.toFixed(2).replace("-","")+'</td>'+
  '</tr>';
if (mountCount == 11) {
html += '<tr style="background-color: #dddddd;font-weight: bold;">'+
    '<td>Total (as of '+dt.getFullYear()+')</td>'+
    '<td>$'+total_emi.toFixed(2)+'</td>'+
    '<td>$'+total_monthly_principal.toFixed(2)+'</td>'+
    '<td>$'+total_monthly_interest.toFixed(2)+'</td>'+
    '<td>$'+p.toFixed(2).replace("-","")+'</td>'+
  '</tr>';
}


  //document.getElementById("tBody").innerHTML = html;


}


}*/

document.addEventListener("DOMContentLoaded", function () {
	document.getElementById("principal_amount").value = "100,000";
	document.getElementById("monthly_rent").value = "1,000";

	resetDownPaymentPercentage();
	Calculate();
});