# hibp-adfs

This script gets the sha1 hash of the submitted password and checks it against the phenomenally wonderful [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3#PwnedPasswords). Pwned passwords will result in a warning message and the end user will not be able to continue login (without fiddling around with developer tools). You may set a minimum threshold of password pwnage, 1 being most stringent.

![2022-04-01 12_07_58-Sign In - Brave](https://user-images.githubusercontent.com/3004481/161301301-4ef0a614-cb8a-4139-a902-719571b980eb.png)

## Install

- Set the min_pwnage to your desired amount
- Set the change_password_url, or set it to an empty string
- Add the contents of this js file to the end of your ADFS theme's `onload.js` file. [Microsoft docs](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/custom-web-themes-in-ad-fs)

## Considerations
- There is no check to verify the submitted password is correct, that comes after the API call.
- If the HaveIBeenPwned API is unavailable or unresponsive from the end user's perspective, the login will continue without the check.
- If the API call takes longer than 2 seconds to complete, the check is aborted and the login will continue.
