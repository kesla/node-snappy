{
  'targets': [
    {
      'target_name': 'binding',
      'include_dirs': [ '<!(node -e "require(\'nan\')")' ],
      'dependencies': [ 'deps/snappy/snappy.gyp:snappy' ],
      'sources': [ 'src/binding.cc' ]
    }
  ]
}
