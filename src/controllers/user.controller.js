import { compare ,genSalt, hash} from 'bcrypt';
import UserModel from '../models/user.model.js';
import {
  createSuccessResponse,
  errorResponse,
  serverErrorResponse,
  successResponse,
} from './../utils/api.response.js';
import { signToken } from '../utils/jwt.utils.js';

export const login = async (req, res) => {
  try {
    const {
      username,
      password
    } = req.body;

    let findUserByUsername = await UserModel.findOne({
      where: {
        username
      }
    });
    if (!findUserByUsername) return errorResponse("Invalid username or password!", res)

    const validPassword = await compare(password, findUserByUsername.password);
    if (!validPassword) return errorResponse('Invalid username or password!', res);

    const token = signToken({ id: findUserByUsername.id });

    return successResponse("Login successful!",{access_token: token},res);

  } catch (error) {
    return serverErrorResponse(error, res);
  }
};

export const register = async(req,res)=>{
  try{
    let {
      username,
      password
    } = req.body;

    let findUserByUsername = await UserModel.findOne({
      where: {
        username
      }
    });
    if (findUserByUsername) return errorResponse(`User with username ${username} already exists!`, res)

    const salt = await genSalt(10);
    password = await hash(password, salt);

    let createdUser = await UserModel.create({
      username,
      password
    })

    const returnResponse ={
      id: createdUser.get('id'),
      username: createdUser.get('username')
    }

    return createSuccessResponse("User registered successfully. You can now login", returnResponse, res);

  }
  catch(error){
    return serverErrorResponse(error, res);
  }
}

export const getProfile = async(req,res)=>{
  try{
      let user = await UserModel.findByPk(req.user.id,{attributes: ['username','id']});
      if (!user) return errorResponse("User not found!",res);

      return successResponse("Profile",user,res)
  }
  catch (ex) {
      return serverErrorResponse(ex,res)
  }
}

