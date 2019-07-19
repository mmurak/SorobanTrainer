// Original Author: Masao Nakagawa@Shiga University
// Modified by: Masaaki Murakami (masaaki.murakai@gmail.com)
//
// keydown() : Internal function for Suspended-Beads and Next>> function
// keyup() : ditto
// mv(name) : Bead move.  name::/(hb|eb)(\d\d)(\d\d\d)/
// putimg(obj, filename) : Internal function
// resetsoroban() : Reset
// setsoroban(heavens, earths) :  heavens::/[uVWX]+/  earths::/[0-5]+/
// undosoroban() : Undo
// redosoroban() : Redo
// encodeAbacus() : Encode to /[uVWX]+:[0-5]+/ expression
// drawAbacus(numOf5s, numOf1s, numOfDigits, numOfClusters) : Draw abacus into sorofield
// changeType(h, e, d) : Change type
// playsound() : Sound effect
// displayTutorialPage() : Display tutorial page
// nextSection() : Next page
// prevSection() : Previous page
// showAnswer() : Show Answer
// retrySection() : Reset pattern to the page
// interpret(num) : Generate internal-rep from /[0-9]+/ format (short-hand rep. used in the tutorial doc.)
// processFile(data) : Tutorial file interpreter
// removeChildren(obj)  : Remove children of the drop down box
// distributeBucket(content) : Distribute each contents of the selection
// window.addEventListener() : Internal use
// selectLesson() : Lesson selector
// soundToggle() : Sound toggle
var resourcedir = "./soroban/";
var imgfilename0 = "soroban0.gif";
var imgfilename1 = "soroban1.gif";
var imgfilenameU = "sorobanU.gif";
var imgfilenameL = "sorobanL.gif";
var imgfilenameB0 = "soroband0.gif";
var imgfilenameB1 = "soroband1.gif";
var digitsoroban;
var heavenBeads;
var earthBeads;
var digitclusters;

var shiftkey = false;

var undoBuffer = [];
var redoBuffer = [];

var initialPatternBuffer = [];
var exitPatternBuffer = [];
var tutorialBuffer = [];
var pagePointer = 0;

var bucket = [];
var soundFlag = true;

//
// Check up for shift key when using Ohtsu mode (suspended bead)
//
document.onkeydown = keydown;
document.onkeyup = keyup;
window.onblur = function () {
  shiftkey = false;
}
function keydown() {
  target = document.getElementById("messageShift");
  if (event.shiftKey == true) {
    shiftkey = true;
  }
}
function keyup() {
  target = document.getElementById("messageShift");
  if (event.shiftKey == false) {
    shiftkey = false;
  }
}

//
// Bead movement
//
function mv(name) {
  var hore = name.substring(0, 2);
  var indexY = name.substring(2, 4);
  var indexX = name.substring(4);
  var img = document.images[name].src;
  if (img.indexOf(imgfilename0) < 0) {  // if rod then nop
    undoBuffer.push(encodeAbacus());
    document.getElementById("UNDO").disabled=false;
    redoBuffer = [];
    document.getElementById("REDO").disabled=true;
    playsound();
    if (hore == 'hb') {  // heaven bead
      for (i = 0; i <= heavenBeads; i++) {
        putimg(hore + indexY + i, imgfilename1);
      }
      if ((heavenBeads > 1) && shiftkey && indexX <= 1) {
        putimg(hore + indexY + 0, imgfilenameU);
        putimg(hore + indexY + 1, imgfilenameL);
      } else {
        putimg(name, imgfilename0);
      }
    } else {  // earth beads
      for (i = 0; i <= earthBeads; i++) {
        putimg(hore + indexY + i, imgfilename1);
      }
      putimg(name, imgfilename0);
    }
  }
}

function putimg(objname, filename) {
  if (document.images[objname].src.indexOf(filename) < 0) {
    document.images[objname].src = resourcedir + filename;
  }
}

//
// Reset field, and undo/redo buffers
//
function resetsoroban() {
  setsoroban('', '');
  undoBuffer = [];
  redoBuffer= [];
  document.getElementById("UNDO").disabled=true;
  document.getElementById("REDO").disabled=true;
  playsound();
}

//
// Set patterns from internal-rep. (/[uVWX]+:[0-5]+/)
//
function setsoroban(heavens, earths) {
  playsound();
  var hvn = heavens.replace(/ +/g, '');
  hvn = hvn + 'u'.repeat(digitsoroban);  // benevolent process
  hvn = hvn.split('');
  var erth = earths.replace(/ +/g, '');
  erth = erth + '0'.repeat(digitsoroban);  // benevolent process
  erth = erth.split('');
  for (i = 0; i < digitsoroban; i++) {
    common = 'hb' +  ("00" +  i).slice(-2);
    switch (hvn.shift().toUpperCase()) {
      case 'X' :
        putimg(common + '0', imgfilenameU);
        putimg(common + '1', imgfilenameL);
        putimg(common + '2', imgfilename1);
        break;
      case 'W' :
        putimg(common + '0', imgfilename0);
        putimg(common + '1', imgfilename1);
        putimg(common + '2', imgfilename1);
        break;
      case 'V' :
        if (heavenBeads == 2) {
          putimg(common + '0', imgfilename1);
          putimg(common + '1', imgfilename0);
          putimg(common + '2', imgfilename1);
        } else {
          putimg(common + '0', imgfilename0);
          putimg(common + '1', imgfilename1);
        }
        break;
      default :
        if (heavenBeads == 2) {
          putimg(common + '0', imgfilename1);
          putimg(common + '1', imgfilename1);
          putimg(common + '2', imgfilename0);
        } else {
          putimg(common + '0', imgfilename1);
          putimg(common + '1', imgfilename0);
        }
        break;
    }
    common = 'eb' +  ("00" +  i).slice(-2);
    for (j = 0; j <= earthBeads; j++) {
      putimg(common + j, imgfilename1);
    }
    putimg(common + Math.min(erth.shift(), earthBeads), imgfilename0);
  }
}

//
// Undo
//
function undosoroban() {
  playsound();
  redoBuffer.push(encodeAbacus());
  document.getElementById("REDO").disabled=false;
  data = undoBuffer.pop();
  if (undoBuffer.length == 0) {
    document.getElementById("UNDO").disabled=true;
  }
  ary = data.split(':');
  setsoroban(ary[0], ary[1]);
}

//
// Redo
//
function redosoroban() {
  playsound();
  undoBuffer.push(encodeAbacus());
  document.getElementById("UNDO").disabled=false;
  data = redoBuffer.pop();
  if (redoBuffer.length == 0) {
    document.getElementById("REDO").disabled=true;
  }
  ary = data.split(':');
  setsoroban(ary[0], ary[1]);
}

//
// Generate internal-rep from field (/[uVWX]+:[0-5]+/)
//
function encodeAbacus() {
  var heavenWork = '';
  var earthWork = '';
  for (i = 0; i < digitsoroban; i++) {
    common = 'hb' +  ("00" +  i).slice(-2);
    if (heavenBeads == 2) {
      if (document.images[common+'0'].src.indexOf(imgfilenameU) >= 0) {
        heavenWork = heavenWork + 'X';
      } else if (document.images[common+'0'].src.indexOf(imgfilename0) >= 0) {
        heavenWork = heavenWork + 'W';
      } else if (document.images[common+'1'].src.indexOf(imgfilename0) >= 0) {
        heavenWork = heavenWork + 'V';
      } else {
        heavenWork = heavenWork + 'u';
      }
    } else {
      if (document.images[common+'0'].src.indexOf(imgfilename0) >= 0) {
        heavenWork = heavenWork + 'V';
      } else {
        heavenWork = heavenWork + 'u';
      }
    }
    common = 'eb' +  ("00" +  i).slice(-2);
    j = 0;
    while (document.images[common+j].src.indexOf(imgfilename1) >= 0) {
      j++;
    }
    earthWork = earthWork + j;
  }
  return heavenWork+':'+earthWork;
}

//
// Draw field (number of heaven beads, number of earth beads, digits, separator digits)
//
function drawAbacus(numOf5s, numOf1s, numOfDigits, numOfClusters) {
  var pointOffset = Math.trunc(numOfDigits / 2)  % numOfClusters;
  heavenBeads = numOf5s;
  earthBeads = numOf1s;
  digitsoroban = numOfDigits;
  digitclusters = numOfClusters;
  var html = "<TABLE BORDER='0' CELLPADDING='0' CELLSPACING='0' STYLE='border:16px ridge brown;background-color:#cccccc;'>\n";
  html += "<TR ALIGN='center' VALIGN='bottom'><TD NOWRAP>\n";
  for (j = 0; j <= numOf5s; j++) {		// 5 beads  mv("hb[00][0-2]")
    for (i = 0; i < numOfDigits; i++) {
      html += "<A HREF='JavaScript:mv(";
      html += '"hb' + ("00" +  i).slice(-2) + j + '");';	// i=1(A), i=2(B), ...
      html += "'>";			// <A HREF='JavaScript:mv('hb[00][0-2]');'><IMG NAME='hb[00][0-2]' src='./soroban1' BORDER='0' VSPACE='0' HSPACE='0'></a><BR>.....
      html += "<IMG NAME='hb" + ("00" +  i).slice(-2) + j + "' src='";
      if (j < numOf5s) {
        html += resourcedir + imgfilename1;		//tama
      } else {
        html += resourcedir + imgfilename0;		//jiku
      }
      html += "' BORDER='0' VSPACE='0' HSPACE='0'></a>";
    }
    html += "<BR>\n";
  }
  html += "</TD>\n</TR>\n<TR ALIGN='center' VALIGN='middle'>\n";
  html += "<TD NOWRAP STYLE='background-color:black;'>";
  for (i = 0; i < numOfDigits; i++) {
    html += "<IMG src='";
    if ((i - pointOffset) % numOfClusters == 0) {
      html += resourcedir + imgfilenameB1;		// bar with dot
    } else {
      html += resourcedir + imgfilenameB0;		// bar without dot
    }
    html += "' BORDER='0' VSPACE='0' HSPACE='0'>";
  }
  html += "</TD>\n</TR>\n<TR ALIGN='center' VALIGN='top'>\n";
  html += "<TD NOWRAP>";
  for (j = 0; j <= numOf1s; j++) {					// 1 beads  mv("eb[00][0-4]")
    for (i = 0; i < numOfDigits; i++) {
      html += "<A HREF='JavaScript:mv(";
      html += '"eb' + ("00" +  i).slice(-2) + j + '");';
      html += "' >";
      html += "<IMG NAME='eb" + ("00" +  i).slice(-2) + j + "' src='";
      if (j > 0) {
        html += resourcedir + imgfilename1;		// tama
      } else {
        html += resourcedir + imgfilename0;		// jiku
      }
      html += "' BORDER='0' VSPACE='0' HSPACE='0'></a>";
    }
    html += "<BR>\n";
  }
  html += "</TD>\n</TR>\n</TABLE>\n";
// Index characters
  html += "<TABLE BORDER='0' CELLPADDING='0' CELLSPACING='0'>\n";
  html += "<TR ALIGN='center' VALIGN='top'>\n<TD NOWRAP>\n";
  for (i = 0; i < numOfDigits; i++) {
    html += "<INPUT TYPE='text' NAME='IDX" + String.fromCharCode(64 + i) + "' SIZE='1' VALUE='" + String.fromCharCode(65+i) + "' MAXLENGTH='1' DISABLED='DISABLED' STYLE='font-size:20px;line-height:100%;width:50px;border:0 solid white;text-align:center;'>";
  }
  html += "</TD>\n</TR>\n</TABLE>\n";
//  alert(html);
  document.getElementById("sorofield").innerHTML = html;
}

//
// Change type of soroban (number of heaven beads, number of earth beads, digits, separator digits)
//
function changeType(h, e, d) {
  resetsoroban();
  drawAbacus(h, e, digitsoroban, d);
  displayTutorialPage();
}

//
// Play sound
//
function playsound(sourcename) {
  if (soundFlag) {
    document.getElementById("se_soroban").currentTime = 0;
    document.getElementById("se_soroban").play();
  }
}

//
// Display tutorial content and set field
//
function displayTutorialPage() {
  //テキストエリアに表示する
  if (tutorialBuffer.length <= pagePointer)
    return;
  var ts = document.getElementById("instructions");
  ts.value = tutorialBuffer[pagePointer];
  ts.style.height = '1em';
  ts.style.height = ts.scrollHeight + 'px';
  var pattern = initialPatternBuffer[pagePointer];
  var pt = pattern.indexOf(':');
  setsoroban(pattern.substr(0, pt), pattern.substr(pt+1));
}

//
// Display next section of tutorial
//
function nextSection() {
  if (pagePointer >= tutorialBuffer.length - 1)
    return;
  if ((shiftkey == false) && (exitPatternBuffer[pagePointer] != encodeAbacus())) {
    alert("珠の配置が違ってます。正しい珠配置を自分で設定するか、[Show Answer]ボタンを押して設定してから[Next>>]ボタンを押してください。（なお、Shiftキーを押しながら[Next>>]ボタンを押すと、本チェックはスキップされます）。\nBeads pattern unmatched.  Place the right answer, or make it right by pressing [Show Answer] before pressing [Next>>]. (If you want to skip this check, use Shift+[Next>>].");
    return;
  }
  pagePointer++;
  displayTutorialPage();
}

//
// Display previous section of tutorial
//
function prevSection() {
  if (pagePointer <= 0)
    return;
  pagePointer--;
  displayTutorialPage();
}

//
// Show answer (give up)
//
function showAnswer() {
  var temp = exitPatternBuffer[pagePointer];
  var hvn = temp.substring(0, temp.indexOf(':'));
  var erth = temp.substring(temp.indexOf(':')+1);
  setsoroban(hvn, erth);
}

//
// Retry this section from start
//
function retrySection() {
  displayTutorialPage();
}

//
// Generate internal-rep from /[0-9]+/ format (short-hand rep. used in the tutorial doc.)
//
function interpret(num) {
  num = num.replace(/ +/g, '');
  num = num + '0'.repeat(digitsoroban);  // benevolent process
  num = num.split('');
  var hvn = '';
  var erth = '';
  for (i = 0; i < digitsoroban; i++) {
    switch (num[i]) {
      case '0' :
        hvn = hvn + 'u';
        erth = erth + '0';
        break;
      case '1' :
        hvn = hvn + 'u';
        erth = erth + '1';
        break;
      case '2' :
        hvn = hvn + 'u';
        erth = erth + '2';
        break;
      case '3' :
        hvn = hvn + 'u';
        erth = erth + '3';
        break;
      case '4' :
        hvn = hvn + 'u';
        erth = erth + '4';
        break;
      case '5' :
        hvn = hvn + 'V';
        erth = erth + '0';
        break;
      case '6' :
        hvn = hvn + 'V';
        erth = erth + '1';
        break;
      case '7' :
        hvn = hvn + 'V';
        erth = erth + '2';
        break;
      case '8' :
        hvn = hvn + 'V';
        erth = erth + '3';
        break;
      case '9' :
        hvn = hvn + 'V';
        erth = erth + '4';
        break;
      default :
    }
  }
  return hvn + ':' + erth;
}

//
// Read tutorial file
//
function processFile(data) {
  var lines = data.split(/\r?\n/);
  var temp = '';
  var text = '';
  initialPatternBuffer = [];
  exitPatternBuffer = [];
  tutorialBuffer = [];
  lines.forEach(function(line) {
    if (ans = line.match(/^ *TYPE: *(\d+), *(\d+), *(\d+), *(\d+) *$/i)) {
      drawAbacus(ans[1], ans[2], ans[3], ans[4]);
      return;
    }
    if (ans = line.match(/^ *INIT:([ 0-9]+)$/i)) {
      initialPatternBuffer.push(interpret(temp = ans[1]));
      if (text != '') {
        tutorialBuffer.push(text);
        text = '';
      }
      return;
    }
    if (ans = line.match(/^ *EXIT:([ 0-9]+)$/i)) {
      exitPatternBuffer.push(interpret(ans[1]));
      return;
    }
    if (ans = line.match(/^ *IBH:([ UVWX]+)$/i)) {
      temp = ans[1];
      if (text != '') {
        tutorialBuffer.push(text);
        text = '';
      }
      return;
    }
    if (ans = line.match(/^ *IBE:([ 0-5]+)$/i)) {
      initialPatternBuffer.push(temp + ":" + ans[1]);
      temp = '';
      return;
    }
    if (ans = line.match(/^ *EBH:([ UVWX]+)$/i)) {
      temp = ans[1];
      if (text != '') {
        tutorialBuffer.push(text);
        text = '';
      }
      return;
    }
    if (ans = line.match(/^ *EBE:([ 0-5]+)$/i)) {
      exitPatternBuffer.push(temp + ":" + ans[1]);
      temp = '';
      return;
    }
    text = text + line + "\r\n";
  });
  if (text != '') {
    tutorialBuffer.push(text);
  }
  var ar = [];
  pagePointer = 0;
  ar.push(initialPatternBuffer[pagePointer]);
  ar.push(tutorialBuffer[pagePointer]);
  ar.push(exitPatternBuffer[pagePointer]);
  return ar;
}

function removeChildren(obj) {
  if (obj.hasChildNodes()) {
    while (obj.childNodes.length > 0) {
      obj.removeChild(obj.firstChild);
    }
  }
  var option = document.createElement("option");
  option.setAttribute("value", 0);
  option.innerHTML = "Select Chapter";
  obj.appendChild(option);
}

function distributeBucket(content) {
  var select = document.getElementById("Lesson");
  removeChildren(select);
  bucket = [];
  var lines = content.split(/\r?\n/);
  var counter = 0;
  lines.forEach(function(line) {
    if (ans = line.match(/^\/\/\[(.*)\].*$/)) {
      var option = document.createElement("option");
      counter++;
      bucket[counter] = "";
      option.setAttribute("value", counter);
      option.innerHTML = ans[1];
      select.appendChild(option);
    } else if (ans = line.match(/^\/\/.*$/)) {
    } else {
      bucket[counter] = bucket[counter] + line + "\n";
    }
  });
}

//
// Event handler for reading tutorial file
//
window.addEventListener('DOMContentLoaded', function() {
    var obj1 = document.getElementById("instructionFile");

    //ダイアログでファイルが選択された時
    obj1.addEventListener("change",function(evt){

        var file = evt.target.files;

        //FileReaderの作成
        var reader = new FileReader();
        //テキスト形式で読み込む
        reader.readAsText(file[0]);

        //読込終了後の処理
        reader.onload = function(ev){
          wholeContent = reader.result;
          distributeBucket(wholeContent);

        }
    },false);
 });

function selectLesson() {
  var chapter = document.getElementById("Lesson").value;
  if (chapter == 0)  return;
  chunks = processFile(bucket[chapter]);
  displayTutorialPage();
}

function soundToggle() {
  var elem = document.getElementById("soundFlag");
  soundFlag = elem.checked;
}
