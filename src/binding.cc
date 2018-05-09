#include "./binding.h"

#include <node_buffer.h>
#include <node_version.h>
#include <snappy.h>

#include <string.h>  // memcpy

#include <string>

namespace nodesnappy {

class CompressWorker : public Nan::AsyncWorker {
  public:
    CompressWorker(std::string* input, Nan::Callback *callback)
      : Nan::AsyncWorker(callback), input(input) {}

    ~CompressWorker() {
      delete input;
    }

    void Execute() {
      snappy::Compress(input->data(), input->length(), &dst);
    }

    void HandleOKCallback() {
      Nan::HandleScope scope;

      v8::Local<v8::Object> res = Nan::NewBuffer(dst.length()).ToLocalChecked();
      memcpy(node::Buffer::Data(res), dst.c_str(), dst.length());

      v8::Local<v8::Value> argv[] = {
          Nan::Null()
        , res
      };

      callback->Call(2, argv, async_resource);
    }

  private:
    std::string* input;
    std::string dst;
};

class IsValidCompressedWorker : public Nan::AsyncWorker {
  public: IsValidCompressedWorker(std::string* input, Nan::Callback * callback)
    : Nan::AsyncWorker(callback), input(input) {}

  ~IsValidCompressedWorker() {
    delete input;
  }

  void Execute() {
    res = snappy::IsValidCompressedBuffer(input->data(), input->length());
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
        Nan::Null()
      , res ? Nan::True() : Nan::False()
    };

    callback->Call(2, argv, async_resource);
  }

  private:
    std::string* input;
    bool res;
};

class UncompressWorker : public Nan::AsyncWorker {
  public:
    UncompressWorker(std::string* input, bool asBuffer, Nan::Callback *callback)
      : Nan::AsyncWorker(callback), input(input), asBuffer(asBuffer) {}

    ~UncompressWorker() {
      delete input;
    }

    void Execute() {
      if (!snappy::Uncompress(input->data(), input->length(), &dst))
        SetErrorMessage("Invalid input");
    }

    void HandleOKCallback() {
      Nan::HandleScope scope;

      v8::Local<v8::Value> res;
      if (asBuffer) {
        res = Nan::NewBuffer(dst.length()).ToLocalChecked();
        memcpy(node::Buffer::Data(res.As<v8::Object>()), dst.c_str(), dst.length());
      } else {
        res = Nan::New<v8::String>(dst.c_str(), dst.length()).ToLocalChecked();
      }

      v8::Local<v8::Value> argv[] = {
          Nan::Null()
        , res
      };

      callback->Call(2, argv, async_resource);
    }

  private:
    std::string* input;
    std::string dst;
    bool asBuffer;
};

NAN_METHOD(Compress) {
  std::string *input;

  if (node::Buffer::HasInstance(info[0]->ToObject())) {
    v8::Local<v8::Object> object = info[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input = new std::string(data, length);
  } else {
    Nan::Utf8String param1(info[0]->ToString());
    input = new std::string(*param1);
  }

  Nan::Callback* callback = new Nan::Callback(
    v8::Local<v8::Function>::Cast(info[1])
  );

  CompressWorker* worker = new CompressWorker(
      input, callback
  );

  Nan::AsyncQueueWorker(worker);

  return;
}

NAN_METHOD(CompressSync) {
  std::string input;
  std::string dst;

  if (node::Buffer::HasInstance(info[0]->ToObject())) {
    v8::Local<v8::Object> object = info[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input.assign(data, length);
  } else {
    Nan::Utf8String param1(info[0]->ToString());
    input.assign(*param1);
  }

  snappy::Compress(input.data(), input.length(), &dst);

  v8::Local<v8::Object> res = Nan::NewBuffer(dst.length()).ToLocalChecked();
  memcpy(node::Buffer::Data(res), dst.c_str(), dst.length());

  info.GetReturnValue().Set(res);
}

NAN_METHOD(IsValidCompressed) {
  v8::Local<v8::Object> object = info[0]->ToObject();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);
  std::string *input = new std::string(data, length);

  Nan::Callback* callback = new Nan::Callback(
    v8::Local<v8::Function>::Cast(info[1])
  );

  IsValidCompressedWorker* worker = new IsValidCompressedWorker(
      input, callback
  );

  Nan::AsyncQueueWorker(worker);

  return;
}

NAN_METHOD(IsValidCompressedSync) {

  v8::Local<v8::Object> object = info[0]->ToObject();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);

  bool res = snappy::IsValidCompressedBuffer(data, length);


  info.GetReturnValue().Set((res ? Nan::True() : Nan::False()));
}

NAN_METHOD(Uncompress) {

  v8::Local<v8::Object> object = info[0].As<v8::Object>();
  v8::Local<v8::Object> optionsObj = info[1].As<v8::Object>();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);
  std::string *input = new std::string(data, length);
  bool asBuffer = Nan::To<bool>(
      Nan::Get(optionsObj, Nan::New("asBuffer").ToLocalChecked())
          .ToLocalChecked()).FromJust();

  Nan::Callback* callback = new Nan::Callback(
    v8::Local<v8::Function>::Cast(info[2])
  );

  UncompressWorker* worker = new UncompressWorker(
      input, asBuffer, callback
  );

  Nan::AsyncQueueWorker(worker);

  return;
}

NAN_METHOD(UncompressSync) {
  std::string dst;

  v8::Local<v8::Object> object = info[0]->ToObject();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);

  v8::Local<v8::Object> optionsObj = info[1].As<v8::Object>();
  bool asBuffer = Nan::To<bool>(
      Nan::Get(optionsObj, Nan::New("asBuffer").ToLocalChecked())
          .ToLocalChecked()).FromJust();

  if (!snappy::Uncompress(data, length, &dst)) {
    return Nan::ThrowError("Invalid input");
  }

  v8::Local<v8::Value> res;
  if (asBuffer) {
    res = Nan::NewBuffer(dst.length()).ToLocalChecked();
    memcpy(node::Buffer::Data(res.As<v8::Object>()), dst.c_str(), dst.length());
  } else {
    res = Nan::New<v8::String>(dst.c_str(), dst.length()).ToLocalChecked();
  }

  info.GetReturnValue().Set(res);
}

extern "C"
NAN_MODULE_INIT(init) {
  Nan::SetMethod(target, "compress", Compress);
  Nan::SetMethod(target, "compressSync", CompressSync);
  Nan::SetMethod(target, "isValidCompressed", IsValidCompressed);
  Nan::SetMethod(target, "isValidCompressedSync", IsValidCompressedSync);
  Nan::SetMethod(target, "uncompress", Uncompress);
  Nan::SetMethod(target, "uncompressSync", UncompressSync);
}

NODE_MODULE(binding, init)
}  // namespace nodesnappy
