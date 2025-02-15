import { React } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Login } from "@/components/Login";
import { Register } from "@/components/Register";
import { Link } from "react-router-dom";

export function AuthPage({ type }) {
    return (
    <div className="flex justify-center ">
                <Tabs defaultValue={type} className="max-h-full w-1/2">
                    <TabsList className="h-12 grid w-full grid-cols-2 gap-2 mb-6 bg-gray-900">
                        {/* Link wrapping TabsTrigger with fixed width and height */}
                        <Link to="/auth/login" className="w-full h-full">
                            <TabsTrigger
                                className="w-full h-full text-xl text-center font-medium text-gray-300 py-2 "
                                value="login"
                            >
                                Login
                            </TabsTrigger>
                        </Link>

                        <Link to="/auth/register" className="w-full h-full">
                            <TabsTrigger
                                className="w-full h-full text-xl text-center font-medium text-gray-300 py-2 "
                                value="register"
                            >
                                Register
                            </TabsTrigger>
                        </Link>
                    </TabsList>

                    <TabsContent value="login" className="relative w-full h-full"> <Login /> </TabsContent>

                    <TabsContent value="register" className="relative w-full h-full"> <Register /> </TabsContent>
                </Tabs>
                </div>
        
    );
}
