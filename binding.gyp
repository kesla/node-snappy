{
  'targets': [
    {
      'target_name': 'binding',
      'includes': [ 'deps/snappy/common.gypi' ],
      'include_dirs': [ '<!(node -e "require(\'nan\')")', 'deps/snappy/<(os_include)' ],
      'dependencies': [ 'deps/snappy/snappy.gyp:snappy' ],
      'sources': [ 'src/binding.cc' ],
      'xcode_settings': {
        'WARNING_CFLAGS': [ '-Wno-sign-compare', '-Wno-unused-function' ],
        'MACOSX_DEPLOYMENT_TARGET': '10.9'
      }
    }
  ]
}
