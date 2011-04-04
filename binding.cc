#include <v8.h>
#include <snappy.h>
#include <node.h>
#include <node_buffer.h>
#include <cstring>

// Create a buffer, as described in http://sambro.is-super-awesome.com/2011/03/03/creating-a-proper-buffer-in-a-node-c-addon/
inline v8::Local<v8::Object> createBuffer(std::string str)
{
	size_t length = str.length();
	char* ptr = &*str.begin();
	node::Buffer *slowBuffer = node::Buffer::New(ptr, length);
	v8::Local<v8::Object> obj = v8::Context::GetCurrent()->Global();
	v8::Local<v8::Function> bufferConstructor = v8::Local<v8::Function>::Cast(obj->Get(v8::String::New("Buffer")));
	v8::Handle<v8::Value> constructorArgs[3] = { slowBuffer->handle_, v8::Integer::New(length), v8::Integer::New(0) };
	return bufferConstructor->NewInstance(3, constructorArgs);
}

v8::Handle<v8::Value>
snappy_compress_binding(const v8::Arguments& args)
{
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  snappy::Compress(*data, data.length(), &dst);
	return scope.Close(createBuffer(dst));
}

v8::Handle<v8::Value>
snappy_uncompress_binding(const v8::Arguments& args)
{
  v8::HandleScope scope;
  v8::Local<v8::String> ret;
  std::string dst;
	v8::Handle<v8::Object> buffer = args[0]->ToObject();
	char* data = node::Buffer::Data(buffer);
	size_t length = node::Buffer::Length(buffer);
  snappy::Uncompress(data, length, &dst);
  ret = v8::String::New(dst.data(), dst.length());
  return scope.Close(ret);
}

extern "C" void
init(v8::Handle<v8::Object> target) 
{
  v8::HandleScope scope;
  v8::Local<v8::Function> compress_fun =
  	v8::FunctionTemplate::New(snappy_compress_binding)->GetFunction();
  v8::Local<v8::Function> uncompress_fun =
  	v8::FunctionTemplate::New(snappy_uncompress_binding)->GetFunction();
	
	target->Set(v8::String::New("compress"), compress_fun);
	target->Set(v8::String::New("uncompress"), uncompress_fun);
}
