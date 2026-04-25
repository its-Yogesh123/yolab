api/[dynamic_route] like
api/hello -> here hello work as value 




```css
User clicks "Sign in with Google"
        ↓
Frontend → signIn("google")
        ↓
Redirect to Google login page
        ↓
User logs in on Google
        ↓
Google sends response back to your app
        ↓
NextAuth receives user + tokens
        ↓
🔥 callbacks.signIn() runs HERE
        ↓
jwt() callback
        ↓
session() callback
        ↓
User is logged in
```