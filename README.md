Introduction
============

The enhanced version of the jQuery Cookie plugin is based on Klaus Hartl's [jQuery Cookie pluging](https://github.com/carhartl/jquery-cookie). The code of the <code>chunkedcookie</code> function comes from the original jQuery Cookie plugin.

This extension to the jQuery Cookie plugin adds the capability to save content that is bigger than 4096 bytes long using two different mechanism: the usage of HTML5's localStorage, or the usage of a series of cookies where the content is chunked and saved. This extension is backward compatible with the jQuery Cookie plugin and its usage should be transparent to the users. Even if existing cookies have been created with the normal Cookie plugin, they will still be usable by this new extension. The usage syntax is the same, but 3 new options have been created.

New Options
===========

Before I explains how this extension works, let me introduce three new options that have been added to the Cookie plugin. These new options will be put into context, and properly defined later in this blog post.

* <code>maxChunkSize</code> - This defines the maximum number of bytes that can be saved in a single cookie. <code>(default: 3000)</code>
* <code>maxNumberOfCookies</code> - This is the maximum number of cookies that can be created for a single domain name. <code>(default: 20)</code>
* <code>useLocalStorage</code> - This tells the extended Cookie plugin to use the HTML5's localStorage capabilities of the browser instead of a cookie to save that value. <code>(default: true)</code>


How Does This Extension Work?
==============================

As I said in the introduction of this blog post, this extension to the jQuery Cookie plugin does two things:

* It uses the HTML5 <code>localStorage</code> capabilities of the browser if this feature is available instead of relying on the cookies. However, if cookies are needed by the developer, this feature can be turned off with the <code>useLocalStorage = false</code> option
* If the <code>localStorage</code> option is disable, or simply not available on a browser, and if the content is bigger than the limit of the size of a cookie, then this extension will chunk the input content, and save it in multiple cookies

If the <code>useLocalStorage</code> is <code>true</code>, then the plugin will try to see if the HTML5 <code>localStorage</code> mechanism is available on the browser. If it is, then it will use that local storage to save and retrieve content to the browser. If it is not, then the plugin will act like if <code>useLocalStorage</code> is <code>false</code> and the process will continue by using cookies to save and read that content from the browser.

If <code>useLocalStorage is <code>false</code>, or if the HTML5 <code>localStorage</code> mechanism is not available on the browser, then the plugin will check if the content is bigger than the <code>maxChunkSize</code> option, than all the chunks will be saved in different cookies until it reaches the limit imposed by the <code>maxNumberOfCookies</code> option.

If cookies are used, then two use-cases can happen:

* The content is smaller than or equal to <code>maxChunkSize</code>
* The content is bigger than <code>maxChunkSize</code>

If the content is smaller than or equal to <code>maxChunkSize</code> than only one cookie will be created by the browser. The name of the cookie will be the value provided to the key parameter.

If the content is bigger than <code>maxChunkSize</code> than multiple cookies will be created, one per chunk. The convention is that the name of the first cookie is the value provided to the <code>key</code> parameter. The name of the other chunks is the value provided to the <code>key</code> parameter with the chunk indicator <code>---ChunkNum</code> append to it. For example, if we have a cookie with a content of 10000 bytes that has <code>maxChunkSize</code> defined to 4000 bytes, then these three cookies would be created:

* <code>cookie-name</code>
* <code>cookie-name---1</code>
* <code>cookie-name---2</code>

Usage
=====

Create a Cookie
---------------

Let's create a cookie that expires in 365 days and where the path is the root:



```javascript
$.cookie('my-cookie', "the-content-of-my-cookie", { expires: 365, path: "/" });
```

By default, this value will be persisted in the localStorage if the browser supports it, and not in a cookie. So, let's see how to force the plugin to save the content in a cookie by using the useLocalStorage option:

```javascript
$.cookie('my-cookie', "the-content-of-my-cookie", {useLocalStorage: false, expires: 365, path: "/" });
```

Delete a Cookie
---------------

Let's see how a cookie can be deleted. The method is simply to put null as the value of the cookie. This will instruct the plugin to remove the cookie.

```javascript
$.cookie('my-cookie', null);
```

With that call, the plugin will try to remove my-cookie both in the localStorage and in the cookies.

Read a Cookie
-------------

Let's see how we can read the content of a cookie:

```javascript
var value = $.cookie('my-cookie');
```

With this call, value will get the content that has been saved in the localStorage, or the cookies. This will depend if the localStorage was available in the browser.

Now, let's see how to force reading the cookies by bypassing the localStorage mechanism:

```javascript
var value = $.cookie('my-cookie', {useLocalStorage: false});
```

Note that if the cookie is not existing for a <code>key</code>, then the <code>$.cookie()</code> function will return <code>null</code>.

Using Limitations
-----------------

Let's see how to use the <code>maxNumberOfCookies</code> and <code>maxChunkSize</code> options to limit the size and the number of cookies to be created.

With this example, the content will be saved in multiple cookies of 1000 bytes each up to 30 cookies:

```javascript
var value = $.cookie('my-cookie', "the-content-of-my-cookie-is-10000-bytes-long...", {useLocalStorage: false, maxChunkSize: 1000, maxNumberOfCookies: 30, expires: 365, path: "/" });
```
