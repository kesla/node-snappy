#include <v8.h>
#include <snappy.h>
#include <node.h>
#include <node_buffer.h>
#include <cstring>


static v8::Handle<v8::Value>
VException(const char *msg) {
    v8::HandleScope scope;
    return v8::ThrowException(v8::Exception::Error(v8::String::New(msg)));
}


v8::Handle<v8::Value>
snappy_compress_binding(const v8::Arguments& args)
{
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  snappy::Compress(*data, data.length(), &dst);
	int length = dst.length();
	node::Buffer *slowBuffer = node::Buffer::New(length);
	memcpy(node::Buffer::Data(slowBuffer), dst.data(), length);
	v8::Local<v8::Object> globalObj = v8::Context::GetCurrent()->Global();
	v8::Local<v8::Function> bufferConstructor = v8::Local<v8::Function>::Cast(globalObj->Get(v8::String::New("Buffer")));
	v8::Handle<v8::Value> constructorArgs[3] = { slowBuffer->handle_, v8::Integer::New(length), v8::Integer::New(0) };
	v8::Local<v8::Object> actualBuffer = bufferConstructor->NewInstance(3, constructorArgs);
	return scope.Close(actualBuffer);
}

v8::Handle<v8::Value>
snappy_decompress_binding(const v8::Arguments& args)
{
  if (!node::Buffer::HasInstance(args[0])) {
		return VException("Only buffers are allowed");
  }
  v8::HandleScope scope;
  v8::Local<v8::String> ret;
  std::string dst;
	v8::Handle<v8::Object> buffer = args[0]->ToObject();
  snappy::Uncompress(node::Buffer::Data(buffer), node::Buffer::Length(buffer), &dst);
  ret = v8::String::New(dst.data(), dst.length());
  return scope.Close(ret);
}

extern "C" void
init(v8::Handle<v8::Object> target) 
{
  v8::HandleScope scope;
	
	target->Set(
		v8::String::New("compress"),
		v8::FunctionTemplate::New(snappy_compress_binding)->GetFunction()
	);
	
	target->Set(
		v8::String::New("uncompress"),
		v8::FunctionTemplate::New(snappy_decompress_binding)->GetFunction()
	);
}
