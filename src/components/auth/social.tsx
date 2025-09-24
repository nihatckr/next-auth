"use client"
import {
  FcGoogle
} from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { Button } from "../ui/button"

export const Social = () => {
  return (
    < >
      <Button variant="outline" className="w-full" onClick={() => { }}>
        <FcGoogle className=" h-5 w-5" />
      </Button>
      <Button variant="outline" className="w-full" onClick={() => { }}>
        <FaGithub className="  h-5 w-5" />
      </Button>
    </ >
  )
}
