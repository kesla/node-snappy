{
  'targets': [
    {
      'target_name': 'binding',
      'include_dirs': ["<!(node -p -e \"require('path').dirname(require.resolve('nan'))\")"],
      'dependencies': [
      	'<(module_root_dir)/deps/snappy/snappy.gyp:snappy'
      ],
      'sources': [
      	'src/binding.cc'
      ]
    }
  ]
}
