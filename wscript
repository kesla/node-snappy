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

	# Change this to the path where you have installed snappy
  snappy_home = "/home/david/local/snappy"

  conf.env.append_value("LIBPATH_SNAPPY", snappy_home + "/lib")
  conf.env.append_value("CPPPATH_SNAPPY", snappy_home + "/include")
  conf.env.append_value("LIB_SNAPPY", "snappy")

def build(bld):
  def cake(tsk):
    abspath = tsk.generator.path.abspath()
    return tsk.generator.bld.exec_command('cake compile', cwd=abspath)


  obj = bld.new_task_gen('cxx', 'shlib', 'node_addon')
  obj.uselib = "SNAPPY"
  obj.cxxflags     = ['-Wall']
  obj.target = 'binding'
  obj.source = 'binding.cc'
  obj.cxxflags     = ['-Wall']
  obj.install_path = None
  
  bld(rule=cake, always=True, name='call cake')
