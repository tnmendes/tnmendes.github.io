

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function arcadeGameKeyPress(userPressedKey) {
     try {

        const keyboardEvent = new KeyboardEvent('keydown', {
             keyCode: userPressedKey,
             view: window,
             bubbles: true
        });
        const keyboardEventUp = new KeyboardEvent('keyup', {
             keyCode: userPressedKey,
             view: window,
             bubbles: true
        });
        document.activeElement.dispatchEvent(keyboardEvent);
        
        sleep(150).then(() => {
            document.activeElement.dispatchEvent(keyboardEventUp);
        });
        window.webkit.messageHandlers.callbackHandler.postMessage({'payload': 'JS: KeyPress ' + userPressedKey})
     } catch(err) {
         console.log('The native context does yet exist')
     }
}


function arcadeGameKeyDown(userPressedKey) {
     try {

     const keyboardEvent2 = new KeyboardEvent('keydown', {
             keyCode: userPressedKey,
             view: window,
             bubbles: true
                     });
         document.activeElement.dispatchEvent(keyboardEvent2);

         window.webkit.messageHandlers
          .callbackHandler.postMessage({'payload': 'JS: KeyDown' + userPressedKey})
     } catch(err) {
         console.log('The native context does yet exist')
     }
}

             
function arcadeGameKeyUp(userPressedKey) {
     try {
         
     const keyboardEvent3 = new KeyboardEvent('keyup', {
                             keyCode: userPressedKey,
                             view: window,
                             bubbles: true
                                     });
    document.activeElement.dispatchEvent(keyboardEvent3);
    window.webkit.messageHandlers.callbackHandler.postMessage({'payload': 'JS: KeyUp ' + userPressedKey})
     } catch(err) {
         console.log('The native context does yet exist')
     }
}
