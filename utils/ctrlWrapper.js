// exports.ctrlWrapper = (ctrlFunc) => {
//   const fn = async (req, res, next) => {
//     try {
//       await ctrlFunc(req, res);
//     } catch (error) {
//       next(error);
//     }
//   };

//   return fn;
// };

const ctrlWrapper = controller => {
  // функция получает (req, res, next)
      const func = async (req, res, next) => {
          try{
              // функция вызывает controller передавая ему наши (req, res, next)
              await controller(req, res, next)
          }catch(error){
              next(error)
          }
      }
      return func
  }
  
  module.exports = ctrlWrapper