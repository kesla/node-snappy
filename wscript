srcdir = '.'
blddir = 'build'
VERSION = '0.0.1'

def set_options(opt):
  opt.tool_options('compiler_cxx')

def configure(conf):
  conf.check_tool('compiler_cxx')
  conf.check_tool('node_addon')

  conf.env.append_value("LIBPATH_SNAPPY", "/home/david/local/snappy/lib")
  conf.env.append_value("LIB_SNAPPY", "snappy")
  conf.env.append_value("CPPPATH_SNAPPY", "/home/david/local/snappy/include")

def build(bld):
  obj = bld.new_task_gen('cxx', 'shlib', 'node_addon')
  obj.target = 'snappy'
  obj.source = 'snappy.cc'
  obj.uselib = "SNAPPY"
  obj.cxxflags     = ['-Wall']
