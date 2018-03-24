{
  'variables': {
    'conditions': [
      ['OS=="linux"',   { 'os_include': 'linux' }],
      ['OS=="mac"',     { 'os_include': 'mac' }],
      ['OS=="solaris"', { 'os_include': 'solaris' }],
      ['OS=="win"',     { 'os_include': 'win32' }],
      ['OS=="freebsd"', { 'os_include': 'freebsd' }]
    ]
  }
}