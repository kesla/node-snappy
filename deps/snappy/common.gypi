{
  'variables': {
    'conditions': [
      ['OS=="linux"', {
        'conditions': [
          ['target_arch=="s390x"', { 'os_include': 'linux/s390x' }],
          ['target_arch=="ppc64"', { 'os_include': 'linux/ppc64' }],
          ['target_arch!="s390x" and target_arch!="ppc64"', { 'os_include': 'linux/generic' }]
        ]
      }],
      ['OS=="mac"',     { 'os_include': 'mac' }],
      ['OS=="solaris"', { 'os_include': 'solaris' }],
      ['OS=="win"',     { 'os_include': 'win32' }],
      ['OS=="freebsd"', { 'os_include': 'freebsd' }]
    ]
  }
}
