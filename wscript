import os
import misc

srcdir = '.'
blddir = 'build'
VERSION = '0.0.1'

def set_options(opt):
  opt.tool_options('compiler_cxx')

def configure(conf):
  conf.check_tool('compiler_cxx')
  conf.check_tool('node_addon')

def build(bld):
  def cake(tsk):
    abspath = tsk.generator.path.abspath()
    return tsk.generator.bld.exec_command('cake compile', cwd=abspath)

  bld(features = 'cxx cstaticlib',
      source = 'lib/snappy.cc lib/snappy-sinksource.cc',
      includes = "lib/",
      target = 'snappy',
      install_path = None,
      name = 'snappylib',
      cxxflags = ['-fPIC'])

  obj = bld.new_task_gen('cxx', 'shlib', 'node_addon')
  obj.target = 'binding'
  obj.source = 'binding.cc'
  obj.cxxflags     = ['-Wall']
  obj.includes = 'lib/'
  obj.uselib_local = 'snappylib'
  obj.install_path = None
  
  bld(rule=cake, always=True, name='call cake')
