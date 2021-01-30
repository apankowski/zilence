# Zilence

Zilence is a Gnome Shell extension turning off notifications while sharing screen during a Zoom call.

It does so by:

* tracking presence of Zoom's screen sharing panel (seen at the top-center of the screen),
* switching "Do Not Disturb" setting accordingly.

## Compatibility

This extension is compatible with Gnome Shell 3.36+.

It has been tested with versions 5.4.2 and 5.4.9 of the Zoom Client for Linux. However, it might work with older Zoom Client versions as well.

## Building

To build the extension from source you'll need `git` and `jq`. You can install these using the following command:

```shell
sudo apt-get install git jq
```

Then run the following command in project's root directory:

```shell
./build.sh
```

In the same directory you'll find the zip file with packaged extension.
