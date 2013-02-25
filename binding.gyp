{
  'targets': [
    {
      'target_name': 'binding',
      'sources': [ 'src/binding.cc', 'deps/libsnappy/snappy.cc', 'deps/libsnappy/snappy-sinksource.cc' ],
      'include_dirs': ['deps/libsnappy/']
    }
  ]
}