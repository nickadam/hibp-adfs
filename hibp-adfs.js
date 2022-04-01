// minimum pwnage before message popup
const min_pwnage = 5

// change password URL, can be empty string
const change_password_url = 'https://www.bing.com'

// sha1 is needed to interface with the hibp API
// https://github.com/kazuho/sha1.min.js
const sha1=function(b){function k(a){return g(h(f(a),a.length*8))}function d(c){var a='',b;for(var d in c)b=c.charCodeAt(d),a+=(b>>4&15).toString(16)+(b&15).toString(16);return a}function e(e){var c='',d=-1,a,f;while(++d<e.length)a=e.charCodeAt(d),f=d+1<e.length?e.charCodeAt(d+1):0,55296<=a&&a<=56319&&56320<=f&&f<=57343&&(a=65536+((a&1023)<<10)+(f&1023),d++),a<=127?c+=b(a):a<=2047?c+=b(192|a>>6&31,128|a&63):a<=65535?c+=b(224|a>>12&15,128|a>>6&63,128|a&63):a<=2097151&&(c+=b(240|a>>18&7,128|a>>12&63,128|a>>6&63,128|a&63));return c}function f(c){var b=[];for(var a=0;a<c.length*8;a+=8)b[a>>5]|=(c.charCodeAt(a/8)&255)<<24-a%32;return b}function g(d){var c='';for(var a=0;a<d.length*32;a+=8)c+=b(d[a>>5]>>24-a%32&255);return c}function h(m,l){m[l>>5]|=128<<24-l%32,m[(l+64>>9<<4)+15]=l;var d=[],e=1732584193,f=-271733879,g=-1732584194,h=271733878,k=-1009589776;for(var n=0;n<m.length;n+=16){var o=e,p=f,q=g,r=h,s=k;for(var b=0;b<80;b++){b<16?d[b]=m[n+b]:d[b]=c(d[b-3]^d[b-8]^d[b-14]^d[b-16],1);var t=a(a(c(e,5),i(b,f,g,h)),a(a(k,d[b]),j(b)));k=h,h=g,g=c(f,30),f=e,e=t}e=a(e,o),f=a(f,p),g=a(g,q),h=a(h,r),k=a(k,s)}return[e,f,g,h,k]}function i(d,a,b,c){return d<20?a&b|~a&c:d<40?a^b^c:d<60?a&b|a&c|b&c:a^b^c}function j(a){return a<20?1518500249:a<40?1859775393:a<60?-1894007588:-899497514}function a(b,c){var a=(b&65535)+(c&65535),d=(b>>16)+(c>>16)+(a>>16);return d<<16|a&65535}function c(a,b){return a<<b|a>>>32-b}return b=String.fromCharCode,function(a){return d(k(e(a)))}}()


// function to check password against hibp, shows message if minimum pwnage
// benignly times out after 2 seconds
const check_hibp = () => {
  const password = document.querySelector('#passwordInput').value

  // ignore empty password
  if(!password) return

  // hide messages
  const pwned_message = document.querySelector('#pwnedMessage')
  if(pwned_message) pwned_message.hidden = true

  // show progress spinner
  const spinner = document.querySelector('#spinningLoader')
  if(spinner) spinner.hidden = false

  // get sha1
  const sha1_hash = sha1(password)
  const first_five = sha1_hash.substring(0, 5)

  // get hibp status
  const xhr = new XMLHttpRequest()
  xhr.open('GET', 'https://api.pwnedpasswords.com/range/' + first_five)
  xhr.timeout = 2000

  xhr.onload = () => {
    if(spinner) spinner.hidden = true // hide progress spinner

    // nothing returned, just login
    if(!xhr.responseText){
      Login.submitLoginRequest()
      return
    }

    const pwned_hashes = xhr.responseText.replace(/\r/, '').split(/\n/)
    for(const pwned_hash_result of pwned_hashes){
      const pwned_hash = first_five.toUpperCase() + pwned_hash_result.split(':')[0]
      const pwnage = pwned_hash_result.split(':')[1]
      if(sha1_hash.toUpperCase() == pwned_hash && pwnage >= min_pwnage){
        console.log('password pwned')
        if(pwned_message) pwned_message.hidden = false
        document.querySelector('#submitButton').hidden = true
        return
      }
    }

    // not pwned, login
    Login.submitLoginRequest()
  }

  xhr.ontimeout = () => { // if timeout normal login
    Login.submitLoginRequest()
  }

  xhr.onerror = () => { // if error normal login
    Login.submitLoginRequest()
  }

  xhr.send()
}

// add hidden pwned message
const pwned_message = document.createElement('div')
pwned_message.setAttribute('id', 'pwnedMessage')
pwned_message.style.paddingBottom = '20px'
pwned_message.innerHTML = '⚠ Warning: The password you entered may not be used. '
pwned_message.style.color = '#d9534f'
document.querySelector('#passwordInput').parentNode.appendChild(pwned_message)
if(change_password_url){
  const change_password_link = document.createElement('a')
  change_password_link.setAttribute('id', 'changePassword')
  change_password_link.classList.add('submit')
  change_password_link.href = change_password_url
  change_password_link.innerHTML = 'Change Password'
  pwned_message.append(change_password_link)
}
pwned_message.hidden = true

// add spinner
const loader_style = document.createElement('style')
loader_style.type = 'text/css'
loader_style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}'
const head = document.querySelector('head')
head.appendChild(loader_style)
const loader = document.createElement('div')
loader.setAttribute('id', 'spinningLoader')
loader.style.cssText = 'border: 6px solid #f3f3f3; border-top: 6px solid #2672ec; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;'
document.querySelector('#passwordInput').parentNode.appendChild(loader)
loader.hidden = true

// override submit button function
const submit_button = document.querySelector('#submitButton')
submit_button.onclick = check_hibp
submit_button.onkeypress = event => {if (event && event.keyCode == 32) check_hibp()}

// override login forms function
const login_form = document.querySelector('form')
login_form.onkeypress = event => {if (event && event.keyCode == 13) check_hibp()}
