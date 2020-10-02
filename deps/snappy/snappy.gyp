{
  'includes': [ 'common.gypi' ],
  'targets': [{
    'target_name': 'snappy',
    'type': 'static_library',

    # Overcomes an issue with the linker and thin .a files on SmartOS
    'standalone_static_library': 1,
    'include_dirs': [ '<(os_include)', 'snappy-1.1.8' ],
    'direct_dependent_settings': {
      'include_dirs': [ 'snappy-1.1.8' ]
    },
    'defines': [ 'HAVE_CONFIG_H=1' ],
    'conditions': [
      ['OS == "win"', {
        'defines': [ '_HAS_EXCEPTIONS=0' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeTypeInfo': 'false',
            'EnableFunctionLevelLinking': 'true',
            'ExceptionHandling': '2',
            'DisableSpecificWarnings': [ '4355', '4530' ,'4267', '4244', '4506', '4018' ]
          }
        }
      }],
      ['OS == "linux"', {
        'cflags': [ '-Wno-sign-compare', '-Wno-unused-function' ],
        'cflags!': [ '-fno-tree-vrp' ]
      }],
      ['OS == "freebsd"', {
        'cflags': [ '-Wno-sign-compare', '-Wno-unused-function' ]
      }],
      ['OS == "solaris"', {
        'cflags': [ '-Wno-sign-compare', '-Wno-unused-function' ]
      }],
      ['OS == "mac"', {
        'xcode_settings': {
          'WARNING_CFLAGS': [ '-Wno-sign-compare', '-Wno-unused-function' ],
          'MACOSX_DEPLOYMENT_TARGET': '10.9'
        }
      }]
    ],
    'sources': [
      'snappy-1.1.8/snappy-internal.h',
      'snappy-1.1.8/snappy-sinksource.cc',
      'snappy-1.1.8/snappy-sinksource.h',
      'snappy-1.1.8/snappy-stubs-internal.cc',
      'snappy-1.1.8/snappy-stubs-internal.h',
      'snappy-1.1.8/snappy.cc',
      'snappy-1.1.8/snappy.h'
    ]
  }]
}
