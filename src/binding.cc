#include "./binding.h"

#include <node_buffer.h>
#include <node_version.h>
#include <snappy.h>

#include <string.h>  // memcpy

#include <string>

namespace nodesnappy {

class CompressWorker : public NanAsyncWorker {
  public:
    CompressWorker(std::string* input, NanCallback *callback)
      : NanAsyncWorker(callback), input(input) {}

    ~CompressWorker() {
      delete input;
    }

    void Execute() {
      snappy::Compress(input->data(), input->length(), &dst);
    }

    void HandleOKCallback() {
      NanScope();

      v8::Local<v8::Object> res = NanNewBufferHandle(dst.length());
      memcpy(node::Buffer::Data(res), dst.c_str(), dst.length());

      v8::Local<v8::Value> argv[] = {
          NanNull()
        , res
      };

      callback->Call(2, argv);
    }

  private:
    std::string* input;
    std::string dst;
};

class IsValidCompressedWorker : public NanAsyncWorker {
  public: IsValidCompressedWorker(std::string* input, NanCallback * callback)
    : NanAsyncWorker(callback), input(input) {}

  ~IsValidCompressedWorker() {
    delete input;
  }

  void Execute() {
    res = snappy::IsValidCompressedBuffer(input->data(), input->length());
  }

  void HandleOKCallback() {
    NanScope();

    v8::Local<v8::Value> argv[] = {
        NanNull()
      , res ? NanTrue() : NanFalse()
    };

    callback->Call(2, argv);
  }

  private:
    std::string* input;
    bool res;
};

class UncompressWorker : public NanAsyncWorker {
  public:
    UncompressWorker(std::string* input, bool asBuffer, NanCallback *callback)
      : NanAsyncWorker(callback), input(input), asBuffer(asBuffer) {}

    ~UncompressWorker() {
      delete input;
    }

    void Execute() {
      if (!snappy::Uncompress(input->data(), input->length(), &dst))
        SetErrorMessage("Invalid input");
    }

    void HandleOKCallback() {
      NanScope();

      v8::Local<v8::Value> res;
      if (asBuffer) {
        res = NanNewBufferHandle(dst.length());
        memcpy(node::Buffer::Data(res.As<v8::Object>()), dst.c_str(), dst.length());
      } else {
        res = NanNew<v8::String>(dst.c_str(), dst.length());
      }

      v8::Local<v8::Value> argv[] = {
          NanNull()
        , res
      };

      callback->Call(2, argv);
    }

  private:
    std::string* input;
    std::string dst;
    bool asBuffer;
};

NAN_METHOD(Compress) {
  NanScope();

  std::string *input;

  if (node::Buffer::HasInstance(args[0]->ToObject())) {
    v8::Handle<v8::Object> object = args[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input = new std::string(data, length);
  } else {
    v8::String::Utf8Value param1(args[0]->ToString());
    input = new std::string(*param1);
  }

  NanCallback* callback = new NanCallback(
    v8::Local<v8::Function>::Cast(args[1])
  );

  CompressWorker* worker = new CompressWorker(
      input, callback
  );

  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

NAN_METHOD(CompressSync) {
  NanScope();

  std::string *input;
  std::string dst;

  if (node::Buffer::HasInstance(args[0]->ToObject())) {
    v8::Handle<v8::Object> object = args[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input = new std::string(data, length);
  } else {
    v8::String::Utf8Value param1(args[0]->ToString());
    input = new std::string(*param1);
  }

  snappy::Compress(input->data(), input->length(), &dst);

  v8::Local<v8::Object> res = NanNewBufferHandle(dst.length());
  memcpy(node::Buffer::Data(res), dst.c_str(), dst.length());

  NanReturnValue(res);
}

NAN_METHOD(IsValidCompressed) {
  NanScope();

  v8::Handle<v8::Object> object = args[0]->ToObject();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);
  std::string *input = new std::string(data, length);

  NanCallback* callback = new NanCallback(
    v8::Local<v8::Function>::Cast(args[1])
  );

  IsValidCompressedWorker* worker = new IsValidCompressedWorker(
      input, callback
  );

  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

NAN_METHOD(IsValidCompressedSync) {
  NanScope();

  v8::Handle<v8::Object> object = args[0]->ToObject();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);

  bool res = snappy::IsValidCompressedBuffer(data, length);


  NanReturnValue((res ? NanTrue() : NanFalse()));
}

NAN_METHOD(Uncompress) {
  NanScope();

  v8::Handle<v8::Object> object = args[0].As<v8::Object>();
  v8::Local<v8::Object> optionsObj = args[1].As<v8::Object>();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);
  std::string *input = new std::string(data, length);
  bool asBuffer = NanBooleanOptionValue(optionsObj, NanNew("asBuffer"));

  NanCallback* callback = new NanCallback(
    v8::Local<v8::Function>::Cast(args[2])
  );

  UncompressWorker* worker = new UncompressWorker(
      input, asBuffer, callback
  );

  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

NAN_METHOD(UncompressSync) {
  NanScope();

  std::string dst;

  v8::Handle<v8::Object> object = args[0]->ToObject();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);

  v8::Local<v8::Object> optionsObj = args[1].As<v8::Object>();
  bool asBuffer = NanBooleanOptionValue(optionsObj, NanNew("asBuffer"));

  if (!snappy::Uncompress(data, length, &dst)) {
    return NanThrowError("Invalid input");
  }

  v8::Local<v8::Value> res;
  if (asBuffer) {
    res = NanNewBufferHandle(dst.length());
    memcpy(node::Buffer::Data(res.As<v8::Object>()), dst.c_str(), dst.length());
  } else {
    res = NanNew<v8::String>(dst.c_str(), dst.length());
  }

  NanReturnValue(res);
}

extern "C" void
init(v8::Handle<v8::Object> exports) {
  NODE_SET_METHOD(exports, "compress", Compress);
  NODE_SET_METHOD(exports, "compressSync", CompressSync);
  NODE_SET_METHOD(exports, "isValidCompressed", IsValidCompressed);
  NODE_SET_METHOD(exports, "isValidCompressedSync", IsValidCompressedSync);
  NODE_SET_METHOD(exports, "uncompress", Uncompress);
  NODE_SET_METHOD(exports, "uncompressSync", UncompressSync);
}

NODE_MODULE(binding, init)
}  // namespace nodesnappy
