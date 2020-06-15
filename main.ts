/*

Our Access Point Name (APN) settings for customers with handsets locked to EE (or previously were) are as follows (ignore any other fields)...

Name: 1pMobile4G
APN: everywhere
Username: Leave Blank
Password: Leave Blank
Proxy: Leave Blank
Port: Leave Blank
Server: Leave Blank
MMSC: http://mms/
MMS Proxy: 149.254.201.135
MMS Port: 8080
MCC: 234
MNC: 30
Authentication Type: PAP
APN Type: If you have choices select internet+mms otherwise type in *

In this case, you must ensure that your message centre number is listed as +447958879879. 
This will enable you to access our network and SMS platform to send and receive text 
messages, both in the UK and abroad. Please refer to your mobile phone
 instruction manual on how to update your message centre number.

*/



// GLOBAL VARIABLES
const tel_no = "+447711076980"            // sms telephone number
const CRLF = "\r\n";
serial.setRxBufferSize(128)
serial.setTxBufferSize(64)
let AT_debug = true    // AT commands shown on console, toggle using Button 'A'
let disabled = false     // alarm scanning disabled when true



input.onButtonPressed(Button.A, function () {
    AT_debug = !AT_debug    // toggle the AT_debug flag when button 'A' pressed
})

/* MODEM and SMS CODE */
// Things to try:
//
// Precede OK in response.includes("OK") with \r\n to make it more specific to match
// sms receive string looks like this ..
// "AT+CMGL\r\n+CMGL: 12,\"REC UNREAD\",\"+447711076980\",\"\",\"20/05/07,16:45:40+04\"\r\nText message\r\n\r\nOK"
// +CPMS: "MT",0,70,"SM_P",0,20,"SM_P",0,20
// AT+CMGR=1 - try this to always read just the first message
function receive_SMS() {
    if (!network_ready()) return ("")   // don't continue if not connected to network
    //    let response = modem_AT("AT+CMGR=1\r")
    //    if (response.includes("OK") && response.includes("+CMGR:") && response.includes(tel_no)) {

    let response = modem_AT("AT+CMGL\r")
    if (response.includes("OK") && response.includes("+CMGL:") && response.includes(tel_no)) {

        // working from the end of the string, count back over final \r\nOK\r\n
        let end_ind = response.length - 6
        // now look for the preceeding '"'
        let start_ind = end_ind
        while (response[start_ind--] != "\"") { }
        response = response.substr(start_ind + 4, end_ind - start_ind - 4)
        //        debug_write(" SMS text: >>" + print_all(response) + "<<" + CRLF)
        del_All_SMS()
    }
    else {
        response = ""
    }
    return (response)
}

function del_All_SMS() {
    if (modem_AT_OK("AT+CMGD=1,4\r"), 25000)    // Can take up to 25 seconds
        //Delete all messages from preferred message storage,
        return (0)  // success
    else
        return (1)
}

// ** DEBUG WRITE **//
function debug_write(s: string) {
    let serial_to = 300
    basic.pause(serial_to)
    serial.redirect(
        SerialPin.USB_TX,
        SerialPin.P8,
        BaudRate.BaudRate4800
    )
    basic.pause(serial_to)
    serial.writeString(s)
    basic.pause(serial_to)
    serial.redirect(
        SerialPin.P16,
        SerialPin.P8,
        BaudRate.BaudRate4800
    )
    basic.pause(serial_to)
}

let str_buff = ""
let SMS_inprogress: boolean = false     // flag for multiline SMS routine
function send_multiline_SMS(str: string) {
    if (!SMS_inprogress) {
        if (!network_ready()) return     // wait for network to come ready
        if (modem_AT("AT+CMGS=\"" + tel_no + "\"\r").includes("\r\n>"))  //tel number with country code
            SMS_inprogress = true
    }
    if (str) {
        str_buff += str
        if (str[str.length - 1] == "\r" || str[str.length - 1] == "\n") {
            modem_AT(str_buff)       // keep sending lines to modem if they end in \r
            str_buff = ""
        }
    }
    else {
        modem_AT(String.fromCharCode(0x1a), 7000) // 7000 * 10 = 60000ms = 60s
        SMS_inprogress = false
    }
}

function send_SMS(str: string) {
    if (!network_ready()) return
    if (modem_AT("AT+CMGS=\"" + tel_no + "\"\r").includes("\r\n>")) { //tel number with country code
        modem_AT(str)
        modem_AT(String.fromCharCode(0x1a), 7000)       // send string and ^z
    }
} ``


function send_email(str: string) {

modem_AT("AT+SAPBR=0,1\r",1000)
basic.pause(1000)

modem_AT("AT&F\r")
modem_AT("AT+CGREG=1\r");   //turn on unsolicited network status
modem_AT("AT+CFUN=1\r")
modem_AT ("AT+CGATT=1\r") // Start GPRS service
modem_AT("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"\r",1000) // set bearer parameter
modem_AT("AT+SAPBR=3,1,\"APN\",\"i\" \r", 1000) // set apn  
//internet+mms
modem_AT("AT+SAPBR=1,1\r",1000) // activate bearer context
modem_AT("AT+SAPBR=2,1\r",1000) // get context ip address
   

modem_AT("AT+EMAILSSL=1\r")
// modem_AT("AT+SMTPSRV=\"212.23.1.19\",587\r")
modem_AT("AT+SMTPSRV=\"mailhost.zen.co.uk\",587\r")
modem_AT("AT+SMTPAUTH=1,\"zen20120@zen.co.uk\",\"HD35ki9K\"\r")
modem_AT("AT+SMTPFROM=\"WhiteEAGLE@netweb.ltd.uk\",\"White Eagle alarm system\"\r")
modem_AT("AT+SMTPRCPT=0,0,\"david@netweb.ltd.uk\",\"David Goddard\"\r")
modem_AT("AT+SMTPSUB=\"First email\"\r")
//modem_AT("AT+SMTPBODY\r")
//modem_AT(str + "\r")
//modem_AT(String.fromCharCode(0x1a), 7000) 
modem_AT("AT+SMTPSEND\r", 10000)
// AT+SMTPSTOP








}





// send str to the modem and wait for to*10 msec for a reply.
// return without timeout if ERROR, OK or '>' seen
function modem_AT(str: string, to?: number) {
    led_plot(1, 2)
    let reply = ""
    let temp = ""
    let timeout = (to ? to : 40)     // 40 x 10ms = 400ms is default timeout
    let to_counter = timeout
    if (AT_debug)
        debug_write(CRLF + CRLF + "Sent: " + print_all(str) + CRLF)
    serial.writeString(str)
    while (to_counter) {
        temp = serial.readString()
        reply += temp
        if (reply.includes("\r\nOK") || reply.includes("ERROR") || reply.includes("\r\n>"))
            break
        if (!temp)              // characters still coming in so don't dec timeout
            to_counter--        // no characters coming in, dec timeout counter
        basic.pause(10)
    }
    if (AT_debug)
        debug_write("\r\n<" + to_counter + ">" + "Received: " + print_all(reply) + CRLF)
    led_unplot(1, 2)
    return (reply)
}

function modem_AT_OK(str: string, to?: number) {
    let response = modem_AT(str, to)
    if (response.includes("\r\nOK"))
        return (0)  // success
    else
        return (1)
}

// make this a function so we can easily disable ped plotting
function led_plot(x: number, y: number) {
    led.plot(x, y)
}
function led_unplot(x: number, y: number) {
    led.unplot(x, y)
}

function modem_init() {
    let err = 0
    serial.redirect(SerialPin.P16, SerialPin.P8, BaudRate.BaudRate4800)
    /*      pins.digitalWritePin(DigitalPin.P11, 1) // start with reset pin high
            basic.pause(1000)
            pins.digitalWritePin(DigitalPin.P11, 0) // reset pin low for >100 ms
            basic.pause(500)
            pins.digitalWritePin(DigitalPin.P11, 1) // reset pin high, wait for module to start (2.7 sec)
            basic.pause(3000)
    */
    basic.pause(6000)
    modem_AT_OK("AT\r", 1000)                   //first command may return an error
    err += modem_AT_OK("AT\r", 1000)            //wait 10s for modem to respond
    //    modem_AT_OK("AT&F\r")                 //factory defaults
    //    modem_AT_OK("AT+IPR=4800\r")          //use fixed baud-rate
    //    modem_AT_OK("AT&W\r")
    //    err += modem_AT_OK("AT\r", 1000)      //Once the handshake test is successful, it will back to OK
    err += modem_AT_OK("AT+CCID\r")             //Read SIM information to confirm whether the SIM is plugged
    err += modem_AT_OK("AT+CMGF=1\r")           // Configuring TEXT mode
    err += modem_AT_OK("AT+CSCS=\"GSM\"\r")
    err += modem_AT_OK("AT+CNMI=0\r")	        //disable unsolicited notice of SMS arriving
    err += modem_AT_OK("AT+EXUNSOL=\"SQ\",0\r") //disable proprietary unsolicited messages
    err += modem_AT_OK("AT+CGREG=0\r")          //Disable network registration unsolicited result code
    err += modem_AT_OK("AT+CPMS=\"MT\"\r")		//set message store
    err += del_All_SMS()                        //clear sms store
    if (err) led_plot(0, 1)                     //indicate an error if there has been one
    network_ready(6000)                         // wait 6000 x 10ms = 60s for network to become ready
}

function get_SQ() {
    let response = modem_AT("AT+CSQ\r")
    response = extract_str(response, "+CSQ: ", ",") // extract SQ
    return (response) //as a string
}

//Check whether modem is registered on the network, timeout after 5 seconds
// future - use extract_str here??
// note there are two timeouts that need to be resolved to one, modem_AT and this routine
function network_ready(timeout?: number) {
    let response: string
    let to = timeout ? timeout : 500
    while (to--) {
        AT_debug ? led_plot(1, 0) : led.unplot(1, 0)    // update AT_debug led
        bar_graph(parseInt(get_SQ()), 31)        // plot a bar graph

        response = modem_AT("AT+CREG?\r")
        if (response.includes("OK") && response.includes("+CREG: 0,1")) {
            led_plot(0, 0)
            return (true)
        }
        else {
            led_unplot(0, 0)
            basic.pause(10)
        }
    }
    return (false)
}



function toUpperCase(str: string) {
    let res = ""
    for (let i = 0; i < str.length(); ++i) {
        if (str[i] >= 'a' && str[i] <= 'z') res += (String.fromCharCode(str.charCodeAt(i) - 32))
        else
            if ((str[i] > 'z' || str[i] < ' ')) res += ""
            else
                res += str[i]
    }
    return (res)
}

function bar_graph(n_val: number, max: number) {
    let led_light = Math.map(n_val, 0, max, 0, 15)
    led_light = Math.round(led_light)
    for (let col = 2; col <= 4; col++) {
        for (let row = 4; row >= 0; row--) {
            led_light >= 0 ? led_plot(col, row) : led.unplot(col, row)
            led_light--
        }
    }
}

function print_all(str: string) {
    let i = 0
    let temp = ""
    while (i <= str.length - 1) {
        if (str[i] < ' ' || str[i] > 'z') temp += "[" + str.charCodeAt(i) + "]"
        else temp += str[i]
        i++
    }
    return (temp)
}

function extract_str(s: string, start: string, end: string) {
    let start_index = s.indexOf(start) + start.length
    let end_index = s.indexOf(end, start_index)
    return (s.substr(start_index, end_index - start_index))
}


basic.pause(5000)

while(true) {
send_email ("Hello World")
modem_AT("",1000)
basic.pause(10000)
}

