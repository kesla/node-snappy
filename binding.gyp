{
  'targets': [
    {
      'target_name': 'binding',
      'include_dirs': ["<!(node -e \"require('nan')\")"],
      'dependencies': [
      	'<(module_root_dir)/deps/snappy/snappy.gyp:snappy'
      ],
      'sources': [
      	'src/binding.cc'
      ]
    }
  ]
}
