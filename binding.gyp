{
  'targets': [
    {
      'target_name': 'binding',
      'dependencies': [
      	'<(module_root_dir)/deps/snappy/snappy.gyp:snappy'
      ],
      'sources': [
      	'src/binding.cc'
      ]
    }
  ]
}